import { create } from 'zustand';
import type { Task, TaskStatus, TaskPriority } from '../types';
import { mockTasks } from '../data/tasks';
import { currentUserId } from '../data/users';

interface TaskState {
  tasks: Task[];
  filterStatus: TaskStatus | 'all';
  filterAssignee: string | 'all';
  filterPriority: TaskPriority | 'all';
  setFilterStatus: (status: TaskStatus | 'all') => void;
  setFilterAssignee: (userId: string | 'all') => void;
  setFilterPriority: (priority: TaskPriority | 'all') => void;
  createTask: (data: Partial<Task>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByAssignee: (userId: string) => Task[];
  getFilteredTasks: () => Task[];
  getMyTasks: () => Task[];
  getTaskById: (id: string) => Task | undefined;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockTasks,
  filterStatus: 'all',
  filterAssignee: 'all',
  filterPriority: 'all',
  
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterAssignee: (userId) => set({ filterAssignee: userId }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  
  createTask: (data) => {
    const newTask: Task = {
      id: generateId(),
      title: data.title || '新任务',
      description: data.description || '',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      assigneeId: data.assigneeId || null,
      creatorId: currentUserId,
      documentId: data.documentId || null,
      dueDate: data.dueDate || null,
      subtasks: data.subtasks || [],
      createdAt: new Date(),
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },
  
  updateTask: (id, data) => {
    set((state) => ({
      tasks: state.tasks.map(t =>
        t.id === id ? { ...t, ...data } : t
      ),
    }));
  },
  
  updateTaskStatus: (id, status) => {
    set((state) => ({
      tasks: state.tasks.map(t =>
        t.id === id ? { ...t, status } : t
      ),
    }));
  },
  
  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== id),
    }));
  },
  
  toggleSubTask: (taskId, subTaskId) => {
    set((state) => ({
      tasks: state.tasks.map(t =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map(st =>
                st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st
              ),
            }
          : t
      ),
    }));
  },
  
  getTasksByStatus: (status) => {
    return get().tasks.filter(t => t.status === status);
  },
  
  getTasksByAssignee: (userId) => {
    return get().tasks.filter(t => t.assigneeId === userId);
  },
  
  getFilteredTasks: () => {
    let tasks = [...get().tasks];
    
    if (get().filterStatus !== 'all') {
      tasks = tasks.filter(t => t.status === get().filterStatus);
    }
    if (get().filterAssignee !== 'all') {
      tasks = tasks.filter(t => t.assigneeId === get().filterAssignee);
    }
    if (get().filterPriority !== 'all') {
      tasks = tasks.filter(t => t.priority === get().filterPriority);
    }
    
    return tasks;
  },
  
  getMyTasks: () => {
    return get().tasks.filter(t => t.assigneeId === currentUserId || t.creatorId === currentUserId);
  },
  
  getTaskById: (id) => {
    return get().tasks.find(t => t.id === id);
  },
}));
