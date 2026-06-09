import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  PenTool,
  CheckSquare,
  Calendar,
  TrendingUp,
  Clock,
  MessageSquare,
  FileCheck,
  ChevronRight,
  Star,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useDocumentStore } from '../store/useDocumentStore';
import { useTaskStore } from '../store/useTaskStore';
import { useScheduleStore } from '../store/useScheduleStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatDateLabel, formatRelativeTime } from '../utils/date';
import { Avatar } from '../components/ui/Avatar';
import { Badge, StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const taskStatusData = [
  { name: '待处理', value: 3, color: '#A4BBD5' },
  { name: '进行中', value: 2, color: '#FFB627' },
  { name: '审核中', value: 1, color: '#4977AB' },
  { name: '已完成', value: 2, color: '#2EC4B6' },
];

const weeklyActivityData = [
  { day: '周一', 文档: 5, 任务: 3, 评论: 8 },
  { day: '周二', 文档: 8, 任务: 5, 评论: 12 },
  { day: '周三', 文档: 6, 任务: 4, 评论: 6 },
  { day: '周四', 文档: 10, 任务: 7, 评论: 15 },
  { day: '周五', 文档: 7, 任务: 6, 评论: 10 },
];

const quickActions = [
  { icon: FileText, label: '新建文档', color: 'bg-accent-500', to: '/documents' },
  { icon: PenTool, label: '新建白板', color: 'bg-primary-500', to: '/whiteboard' },
  { icon: CheckSquare, label: '新建任务', color: 'bg-success-500', to: '/tasks' },
  { icon: Calendar, label: '新建日程', color: 'bg-warning-500', to: '/schedule' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const Workbench: React.FC = () => {
  const navigate = useNavigate();
  const { documents, spaces, activities } = useDocumentStore();
  const { tasks, getMyTasks } = useTaskStore();
  const { schedules, getMySchedules } = useScheduleStore();
  const { currentUser, getUserById } = useAuthStore();

  const myTasks = getMyTasks().slice(0, 5);
  const mySchedules = getMySchedules().slice(0, 3);
  const recentDocs = [...documents]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 4);
  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;
  const todaySchedules = getMySchedules().filter(s =>
    s.startTime.toDateString() === new Date().toDateString()
  );

  const getSpaceColor = (spaceId: string) => {
    const space = spaces.find(s => s.id === spaceId);
    return space?.color || '#1E3A5F';
  };

  const getSpaceName = (spaceId: string) => {
    const space = spaces.find(s => s.id === spaceId);
    return space?.name || '未知空间';
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 max-w-[1600px] mx-auto"
    >
      <motion.div variants={item} className="mb-8">
        <h1 className="text-2xl font-display font-bold text-primary-800 mb-2">
          欢迎回来，{currentUser?.name} 👋
        </h1>
        <p className="text-primary-500">
          今天是 {formatDateLabel(new Date())}，您有 {todaySchedules.length} 个会议和 {todoCount} 个待处理任务
        </p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 bg-gradient-to-br from-accent-500 to-accent-600 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-accent-100 text-sm mb-1">文档总数</p>
              <p className="text-3xl font-bold">{documents.length}</p>
              <p className="text-accent-100 text-xs mt-2">+3 本周新增</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary-100 text-sm mb-1">任务完成率</p>
              <p className="text-3xl font-bold">{completionRate}%</p>
              <p className="text-primary-100 text-xs mt-2">{doneCount}/{tasks.length} 已完成</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-success-100 text-sm mb-1">今日日程</p>
              <p className="text-3xl font-bold">{todaySchedules.length}</p>
              <p className="text-success-100 text-xs mt-2">个会议待参加</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-warning-500 to-warning-600 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-warning-100 text-sm mb-1">待处理任务</p>
              <p className="text-3xl font-bold">{todoCount}</p>
              <p className="text-warning-100 text-xs mt-2">个任务待处理</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="mb-8">
        <h2 className="text-lg font-display font-semibold text-primary-800 mb-4">快捷操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.to)}
              className="card p-5 flex flex-col items-center gap-3 text-center group"
            >
              <div className={`${action.color} p-4 rounded-xl text-white transition-transform group-hover:scale-110`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="font-medium text-primary-700">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-primary-800">最近访问</h2>
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                查看全部
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentDocs.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => navigate(`/documents/${doc.spaceId}/${doc.id}`)}
                  className="p-4 rounded-xl border border-primary-100 hover:border-accent-200 hover:bg-accent-50/30 cursor-pointer transition-all group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${getSpaceColor(doc.spaceId)}20` }}
                    >
                      <FileText className="w-5 h-5" style={{ color: getSpaceColor(doc.spaceId) }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-primary-800 truncate group-hover:text-accent-600 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-primary-400 mt-1">
                        {getSpaceName(doc.spaceId)} · {formatRelativeTime(doc.updatedAt)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-lg font-display font-semibold text-primary-800 mb-4">本周活跃度</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivityData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#7699C0', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7699C0', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(30, 58, 95, 0.12)',
                    }}
                  />
                  <Bar dataKey="文档" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="任务" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="评论" fill="#2EC4B6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-6">
          <div className="card p-5">
            <h2 className="text-lg font-display font-semibold text-primary-800 mb-4">任务状态</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {taskStatusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-primary-600">{item.name}</span>
                  <span className="text-primary-400 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-primary-800">我的任务</h2>
              <Badge variant="accent" size="sm">{myTasks.length} 个</Badge>
            </div>
            <div className="space-y-3">
              {myTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => navigate(`/tasks`)}
                  className="p-3 rounded-lg hover:bg-primary-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                        task.status === 'done' ? 'bg-success-500' :
                        task.status === 'in_progress' ? 'bg-warning-500' :
                        task.status === 'review' ? 'bg-primary-500' : 'bg-primary-300'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        task.status === 'done' ? 'text-primary-400 line-through' : 'text-primary-700'
                      }`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-primary-800">团队动态</h2>
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
              查看全部
            </Button>
          </div>
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity, index) => {
              const user = getUserById(activity.userId);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <Avatar src={user?.avatar} name={user?.name} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm text-primary-700">
                      <span className="font-medium text-primary-800">{user?.name}</span>{' '}
                      {activity.description}
                    </p>
                    <p className="text-xs text-primary-400 mt-0.5">
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-primary-800">即将开始</h2>
            <Badge variant="warning" size="sm">{todaySchedules.length} 个</Badge>
          </div>
          <div className="space-y-3">
            {mySchedules.map((schedule) => {
              const participants = schedule.participantIds.map(id => getUserById(id)).filter(Boolean);
              const isToday = schedule.startTime.toDateString() === new Date().toDateString();
              return (
                <div
                  key={schedule.id}
                  onClick={() => navigate('/schedule')}
                  className="p-4 rounded-xl border border-primary-100 hover:border-accent-200 hover:bg-accent-50/30 cursor-pointer transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-1 h-full min-h-[48px] rounded-full flex-shrink-0 ${
                      isToday ? 'bg-accent-500' : 'bg-primary-200'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-primary-800">{schedule.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-primary-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          {isToday ? '今天 ' : formatDateLabel(schedule.startTime)}
                          {schedule.startTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} -
                          {schedule.endTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex -space-x-2">
                          {participants.slice(0, 3).map((p, i) => (
                            <Avatar key={i} src={p?.avatar} name={p?.name} size="xs" className="z-10" />
                          ))}
                        </div>
                        <span className="text-xs text-primary-400">{participants.length} 人</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
