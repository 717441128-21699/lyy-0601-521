import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  MoreHorizontal,
  Calendar,
  User,
  CheckSquare,
  Square,
  MessageSquare,
  X,
  Flag,
  ChevronDown,
  Filter,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { useAuthStore } from '../store/useAuthStore';
import { Avatar } from '../components/ui/Avatar';
import { Badge, StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatDateLabel, formatRelativeTime } from '../utils/date';
import type { Task, TaskStatus, TaskPriority, SubTask } from '../types';

const statusColumns: { id: TaskStatus; title: string; color: string; bgColor: string }[] = [
  { id: 'todo', title: '待处理', color: 'text-primary-500', bgColor: 'bg-primary-100' },
  { id: 'in_progress', title: '进行中', color: 'text-warning-600', bgColor: 'bg-warning-100' },
  { id: 'review', title: '审核中', color: 'text-primary-600', bgColor: 'bg-primary-100' },
  { id: 'done', title: '已完成', color: 'text-success-600', bgColor: 'bg-success-100' },
];

interface SortableTaskCardProps {
  task: Task;
  onClick: () => void;
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { getUserById } = useAuthStore();
  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
  const completedSubtasks = task.subtasks.filter(st => st.isCompleted).length;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`bg-white rounded-xl p-4 border border-primary-100 cursor-pointer transition-all ${
        isDragging ? 'opacity-50 shadow-xl' : 'hover:shadow-md hover:border-accent-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className={`font-medium text-sm ${
          task.status === 'done' ? 'text-primary-400 line-through' : 'text-primary-800'
        }`}>
          {task.title}
        </h4>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="text-xs text-primary-500 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {task.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex-1 h-1.5 bg-primary-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }}
                className="h-full bg-success-500 rounded-full"
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-primary-400">
              {completedSubtasks}/{task.subtasks.length}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${
              isOverdue ? 'text-red-500' : 'text-primary-400'
            }`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDateLabel(task.dueDate)}</span>
            </div>
          )}
          {assignee && (
            <div className="flex items-center gap-1">
              <Avatar src={assignee.avatar} name={assignee.name} size="xs" />
            </div>
          )}
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1 hover:bg-primary-50 rounded"
        >
          <MoreHorizontal className="w-4 h-4 text-primary-400" />
        </button>
      </div>
    </motion.div>
  );
};

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
  const { updateTask, toggleSubTask, deleteTask } = useTaskStore();
  const { users, getUserById, currentUser } = useAuthStore();
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(task?.title || '');
  const [newSubTask, setNewSubTask] = useState('');

  if (!task) return null;

  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
  const creator = getUserById(task.creatorId);

  const handleSaveTitle = () => {
    if (title.trim()) {
      updateTask(task.id, { title: title.trim() });
    }
    setEditingTitle(false);
  };

  const handleAddSubTask = () => {
    if (newSubTask.trim()) {
      const newSub: SubTask = {
        id: Math.random().toString(36).substr(2, 9),
        title: newSubTask.trim(),
        taskId: task.id,
        isCompleted: false,
        order: task.subtasks.length,
      };
      updateTask(task.id, { subtasks: [...task.subtasks, newSub] });
      setNewSubTask('');
    }
  };

  const handleStatusChange = (status: TaskStatus) => {
    updateTask(task.id, { status });
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    updateTask(task.id, { priority });
  };

  const handleAssigneeChange = (userId: string | null) => {
    updateTask(task.id, { assigneeId: userId });
  };

  const handleDelete = () => {
    if (confirm('确定要删除这个任务吗？')) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-3">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
      }
      footer={
        <div className="flex justify-between w-full">
          <Button variant="ghost" onClick={handleDelete} className="text-red-500 hover:text-red-600">
            删除任务
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              关闭
            </Button>
            <Button onClick={onClose}>
              保存
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          {editingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              className="w-full text-2xl font-bold text-primary-800 bg-transparent border-b-2 border-accent-400 outline-none pb-2"
              autoFocus
            />
          ) : (
            <h2
              className="text-2xl font-bold text-primary-800 cursor-pointer hover:text-accent-600 transition-colors"
              onClick={() => {
                setTitle(task.title);
                setEditingTitle(true);
              }}
            >
              {task.title}
            </h2>
          )}
          <p className="text-sm text-primary-400 mt-2">
            由 {creator?.name} 创建于 {formatDateLabel(task.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-600 flex items-center gap-2">
              <Flag className="w-4 h-4" /> 优先级
            </label>
            <select
              value={task.priority}
              onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 rounded-lg border border-primary-200 bg-white text-primary-700 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="urgent">紧急</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-600 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" /> 状态
            </label>
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 rounded-lg border border-primary-200 bg-white text-primary-700 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none"
            >
              <option value="todo">待处理</option>
              <option value="in_progress">进行中</option>
              <option value="review">审核中</option>
              <option value="done">已完成</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-primary-600 flex items-center gap-2">
              <User className="w-4 h-4" /> 负责人
            </label>
            <select
              value={task.assigneeId || ''}
              onChange={(e) => handleAssigneeChange(e.target.value || null)}
              className="w-full px-3 py-2 rounded-lg border border-primary-200 bg-white text-primary-700 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none"
            >
              <option value="">未分配</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-primary-600">描述</label>
          <textarea
            value={task.description}
            onChange={(e) => updateTask(task.id, { description: e.target.value })}
            placeholder="添加任务描述..."
            className="w-full px-4 py-3 rounded-lg border border-primary-200 text-primary-700 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none resize-none"
            rows={4}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-primary-800 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              子任务 ({task.subtasks.filter(st => st.isCompleted).length}/{task.subtasks.length})
            </h3>
          </div>

          <div className="space-y-2">
            {task.subtasks.map(subtask => (
              <div
                key={subtask.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-50 transition-colors group"
              >
                <button
                  onClick={() => toggleSubTask(task.id, subtask.id)}
                  className="flex-shrink-0"
                >
                  {subtask.isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-success-500" />
                  ) : (
                    <Square className="w-5 h-5 text-primary-300 group-hover:text-primary-400" />
                  )}
                </button>
                <span className={`flex-1 ${
                  subtask.isCompleted ? 'text-primary-400 line-through' : 'text-primary-700'
                }`}>
                  {subtask.title}
                </span>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubTask}
                onChange={(e) => setNewSubTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubTask()}
                placeholder="添加子任务..."
                className="flex-1 px-3 py-2 rounded-lg border border-primary-200 text-primary-700 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none text-sm"
              />
              <Button onClick={handleAddSubTask} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-primary-100">
          <h3 className="font-medium text-primary-800 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> 活动
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Avatar src={currentUser?.avatar} name={currentUser?.name} size="sm" />
              <div className="flex-1">
                <textarea
                  placeholder="添加评论..."
                  className="w-full px-3 py-2 rounded-lg border border-primary-200 text-primary-700 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none resize-none text-sm"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const Tasks: React.FC = () => {
  const { tasks, getTasksByStatus, updateTaskStatus, filterStatus, filterAssignee, filterPriority, setFilterStatus, setFilterAssignee, setFilterPriority, viewMode, setViewMode, getFilteredTasks } = useTaskStore();
  const { users } = useAuthStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    assigneeId: null as string | null,
    dueDate: null as Date | null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedTaskId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedTaskId(null);

    if (over && active.id !== over.id) {
      const activeTask = tasks.find(t => t.id === active.id);
      const overTask = tasks.find(t => t.id === over.id);

      if (activeTask && overTask) {
        const overColumn = over.id.toString().startsWith('column-')
          ? over.id.toString().replace('column-', '') as TaskStatus
          : overTask.status;

        if (activeTask.status !== overColumn) {
          updateTaskStatus(activeTask.id, overColumn);
        }
      }
    }
  };

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      useTaskStore.getState().createTask({
        ...newTask,
        status: 'todo',
      });
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assigneeId: null,
        dueDate: null,
      });
      setShowNewTaskModal(false);
    }
  };

  const openTaskDetail = (task: Task) => {
    setActiveTask(task);
    setShowDetailModal(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const draggedTask = draggedTaskId ? tasks.find(t => t.id === draggedTaskId) : null;

  const filteredTasks = getFilteredTasks();

  const getFilteredTasksByStatus = (status: TaskStatus) => {
    return filteredTasks.filter(t => t.status === status);
  };

  const hasActiveFilters = filterStatus !== 'all' || filterAssignee !== 'all' || filterPriority !== 'all';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 h-full flex flex-col"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary-800">任务管理</h1>
          <p className="text-primary-500 mt-1">共 {tasks.length} 个任务</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-primary-50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'kanban' ? 'bg-white shadow text-primary-700' : 'text-primary-400 hover:text-primary-600'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list' ? 'bg-white shadow text-primary-700' : 'text-primary-400 hover:text-primary-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowNewTaskModal(true)}>
            新建任务
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
            className="px-3 py-1.5 rounded-lg border border-primary-200 text-sm text-primary-700 focus:border-accent-400 outline-none bg-white"
          >
            <option value="all">全部状态</option>
            <option value="todo">待处理</option>
            <option value="in_progress">进行中</option>
            <option value="review">审核中</option>
            <option value="done">已完成</option>
          </select>
        </div>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
          className="px-3 py-1.5 rounded-lg border border-primary-200 text-sm text-primary-700 focus:border-accent-400 outline-none bg-white"
        >
          <option value="all">全部优先级</option>
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
          <option value="urgent">紧急</option>
        </select>

        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value === 'all' ? 'all' : e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-primary-200 text-sm text-primary-700 focus:border-accent-400 outline-none bg-white"
        >
          <option value="all">全部负责人</option>
          <option value="">未分配</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </motion.div>

      {filteredTasks.length === 0 && hasActiveFilters ? (
        <motion.div
          variants={itemVariants}
          className="flex-1 flex flex-col items-center justify-center text-center p-12"
        >
          <CheckSquare className="w-16 h-16 text-primary-200 mb-4" />
          <p className="text-primary-400 text-lg">没有找到匹配的任务</p>
          <p className="text-primary-300 text-sm mt-1">尝试调整筛选条件或清除筛选</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setFilterStatus('all');
              setFilterAssignee('all');
              setFilterPriority('all');
            }}
          >
            清除所有筛选
          </Button>
        </motion.div>
      ) : viewMode === 'kanban' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <motion.div variants={itemVariants} className="flex-1 grid grid-cols-4 gap-4 min-h-0">
            {statusColumns.map(column => {
              const columnTasks = getFilteredTasksByStatus(column.id);
              return (
                <div
                  key={column.id}
                  id={`column-${column.id}`}
                  className="bg-primary-50/50 rounded-xl p-4 flex flex-col min-h-0"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${column.bgColor.replace('bg-', '')}`} />
                      <h3 className={`font-semibold ${column.color}`}>{column.title}</h3>
                      <Badge variant="outline" size="sm">{columnTasks.length}</Badge>
                    </div>
                    <button className="p-1 hover:bg-white rounded">
                      <Plus className="w-4 h-4 text-primary-400" />
                    </button>
                  </div>

                  <SortableContext
                    items={columnTasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex-1 space-y-3 overflow-y-auto">
                      {columnTasks.map(task => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onClick={() => openTaskDetail(task)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </motion.div>

          <DragOverlay>
            {draggedTask ? (
              <div className="bg-white rounded-xl p-4 border-2 border-accent-400 shadow-xl opacity-90 w-72">
                <h4 className="font-medium text-sm text-primary-800">{draggedTask.title}</h4>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <motion.div variants={itemVariants} className="flex-1 bg-white rounded-xl border border-primary-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">任务</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">优先级</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">负责人</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">截止日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">进度</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {filteredTasks.map(task => {
                const assignee = task.assigneeId ? users.find(u => u.id === task.assigneeId) : null;
                const completed = task.subtasks.filter(st => st.isCompleted).length;
                const total = task.subtasks.length;
                return (
                  <tr
                    key={task.id}
                    onClick={() => openTaskDetail(task)}
                    className="hover:bg-accent-50/30 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-primary-800">{task.title}</p>
                        <p className="text-xs text-primary-400 mt-0.5">{formatRelativeTime(task.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-6 py-4"><StatusBadge status={task.status} /></td>
                    <td className="px-6 py-4">
                      {assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar src={assignee.avatar} name={assignee.name} size="xs" />
                          <span className="text-sm text-primary-700">{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-primary-400">未分配</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {task.dueDate ? (
                        <span className="text-sm text-primary-600">{formatDateLabel(task.dueDate)}</span>
                      ) : (
                        <span className="text-sm text-primary-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {total > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-primary-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-success-500 rounded-full"
                              style={{ width: `${(completed / total) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-primary-500">{completed}/{total}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-primary-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      <TaskDetailModal
        task={activeTask}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />

      <Modal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        title="新建任务"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowNewTaskModal(false)}>
              取消
            </Button>
            <Button onClick={handleCreateTask}>
              创建
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">任务标题</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="输入任务标题..."
              className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">描述</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="添加任务描述..."
              className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">优先级</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none bg-white"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">紧急</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">负责人</label>
              <select
                value={newTask.assigneeId || ''}
                onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value || null })}
                className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none bg-white"
              >
                <option value="">未分配</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
