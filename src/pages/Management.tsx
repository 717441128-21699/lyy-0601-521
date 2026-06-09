import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Folder as FolderIcon,
  Settings,
  BarChart3,
  Plus,
  MoreHorizontal,
  Edit2,
  Trash2,
  ChevronRight,
  Star,
  Shield,
  Clock,
  FileText,
  CheckSquare,
  MessageSquare,
  Calendar,
  Search,
  X,
  Crown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { useDocumentStore } from '../store/useDocumentStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTaskStore } from '../store/useTaskStore';
import { useScheduleStore } from '../store/useScheduleStore';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatDateLabel, formatRelativeTime } from '../utils/date';
import type { Space, Folder, User } from '../types';

const tabs = [
  { id: 'spaces', icon: FolderIcon, label: '空间管理' },
  { id: 'members', icon: Users, label: '成员管理' },
  { id: 'permissions', icon: Shield, label: '权限设置' },
  { id: 'activity', icon: BarChart3, label: '团队活跃度' },
];

const activityTrendData = [
  { day: '周一', 文档: 12, 任务: 8, 评论: 15 },
  { day: '周二', 文档: 18, 任务: 12, 评论: 22 },
  { day: '周三', 文档: 15, 任务: 10, 评论: 18 },
  { day: '周四', 文档: 22, 任务: 15, 评论: 28 },
  { day: '周五', 文档: 28, 任务: 18, 评论: 32 },
  { day: '周六', 文档: 8, 任务: 5, 评论: 10 },
  { day: '周日', 文档: 6, 任务: 3, 评论: 8 },
];

const memberContributionData = [
  { name: '陈明', 文档: 15, 任务: 8, 评论: 22 },
  { name: '张三', 文档: 12, 任务: 12, 评论: 18 },
  { name: '李四', 文档: 8, 任务: 15, 评论: 12 },
  { name: '王五', 文档: 10, 任务: 10, 评论: 15 },
  { name: '赵六', 文档: 5, 任务: 5, 评论: 8 },
];

const activityTypeData = [
  { name: '文档编辑', value: 35, color: '#FF6B35' },
  { name: '任务完成', value: 25, color: '#2EC4B6' },
  { name: '评论互动', value: 30, color: '#1E3A5F' },
  { name: '日程安排', value: 10, color: '#FFB627' },
];

const roleConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  admin: { label: '管理员', color: 'text-accent-700', bgColor: 'bg-accent-100' },
  member: { label: '成员', color: 'text-primary-700', bgColor: 'bg-primary-100' },
  guest: { label: '访客', color: 'text-warning-700', bgColor: 'bg-warning-100' },
};

const permissionLevels = [
  { value: 'viewer', label: '查看者', description: '只能查看内容' },
  { value: 'editor', label: '编辑者', description: '可以编辑和创建内容' },
  { value: 'manager', label: '管理者', description: '可以管理权限和删除内容' },
];

export const Management: React.FC = () => {
  const { spaces, folders, documents, activities, toggleFavorite, createSpace } = useDocumentStore();
  const { users, currentUser, getUserById } = useAuthStore();
  const { tasks } = useTaskStore();
  const { schedules } = useScheduleStore();

  const [activeTab, setActiveTab] = useState('spaces');
  const [showNewSpaceModal, setShowNewSpaceModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [newSpace, setNewSpace] = useState({ name: '', description: '', color: '#1E3A5F' });

  const totalDocuments = documents.length;
  const totalTasks = tasks.length;
  const totalSchedules = schedules.length;
  const totalMembers = users.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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

  const handleCreateSpace = () => {
    if (newSpace.name.trim()) {
      createSpace(newSpace);
      setNewSpace({ name: '', description: '', color: '#1E3A5F' });
      setShowNewSpaceModal(false);
    }
  };

  const renderSpacesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold text-primary-800">
          空间列表 ({spaces.length})
        </h2>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowNewSpaceModal(true)}>
          新建空间
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spaces.map((space, index) => {
          const spaceFolders = folders.filter(f => f.spaceId === space.id);
          const spaceDocs = documents.filter(d => d.spaceId === space.id);
          const owner = getUserById(space.ownerId);

          return (
            <motion.div
              key={space.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-5 group hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${space.color}15` }}
                  >
                    <FolderIcon className="w-6 h-6" style={{ color: space.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-800 group-hover:text-accent-600 transition-colors">
                      {space.name}
                    </h3>
                    <p className="text-xs text-primary-400">
                      {spaceFolders.length} 个文件夹 · {spaceDocs.length} 个文档
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFavorite(space.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      space.isFavorite
                        ? 'text-warning-500 bg-warning-50'
                        : 'text-primary-300 hover:text-warning-500 hover:bg-warning-50'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${space.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-1.5 rounded-lg text-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {space.description && (
                <p className="text-sm text-primary-500 mb-4 line-clamp-2">
                  {space.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-primary-100">
                <div className="flex items-center gap-2">
                  <Avatar src={owner?.avatar} name={owner?.name} size="xs" />
                  <span className="text-xs text-primary-400">
                    {owner?.name} 创建
                  </span>
                </div>
                <span className="text-xs text-primary-400">
                  {formatDateLabel(space.createdAt)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderMembersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-display font-semibold text-primary-800">
          团队成员 ({users.length})
        </h2>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowMemberModal(true)}>
          添加成员
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-primary-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                成员
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                角色
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                贡献
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                加入时间
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-primary-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-100">
            {users.map((user, index) => {
              const userDocs = documents.filter(d => d.createdBy === user.id).length;
              const userTasks = tasks.filter(t => t.creatorId === user.id).length;
              const userComments = activities.filter(a => a.userId === user.id && a.type === 'comment').length;
              const role = roleConfig[user.role];

              return (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-primary-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar} name={user.name} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-primary-800">{user.name}</span>
                          {user.role === 'admin' && (
                            <Crown className="w-4 h-4 text-warning-500" />
                          )}
                        </div>
                        <p className="text-xs text-primary-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`${role.color} ${role.bgColor} border-0`}>
                      {role.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm text-primary-600">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4 text-accent-500" />
                        {userDocs}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-4 h-4 text-success-500" />
                        {userTasks}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-primary-500" />
                        {userComments}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-primary-500">
                      {formatDateLabel(user.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 hover:bg-primary-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-primary-400" />
                      </button>
                      {user.id !== currentUser?.id && user.role !== 'admin' && (
                        <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-display font-semibold text-primary-800">
        文件夹权限设置
      </h2>

      <div className="bg-white rounded-xl border border-primary-100 overflow-hidden">
        {folders.map((folder, index) => {
          const space = spaces.find(s => s.id === folder.spaceId);
          const parentFolder = folder.parentId ? folders.find(f => f.id === folder.parentId) : null;

          return (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="p-4 border-b border-primary-50 hover:bg-primary-50/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${space?.color || '#1E3A5F'}15` }}
                  >
                    <FolderIcon className="w-5 h-5" style={{ color: space?.color || '#1E3A5F' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary-800">{folder.name}</span>
                      {parentFolder && (
                        <span className="text-xs text-primary-400 flex items-center gap-1">
                          <ChevronRight className="w-3 h-3" />
                          {parentFolder.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-primary-400">
                      {space?.name} · {Object.keys(folder.permissions).length} 人已授权
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {Object.entries(folder.permissions).slice(0, 3).map(([userId, role]) => {
                      const user = getUserById(userId);
                      return (
                        <div key={userId} className="relative" title={`${user?.name} - ${permissionLevels.find(p => p.value === role)?.label}`}>
                          <Avatar src={user?.avatar} name={user?.name} size="xs" className="z-10" />
                        </div>
                      );
                    })}
                    {Object.keys(folder.permissions).length > 3 && (
                      <span className="text-xs text-primary-400 ml-1">
                        +{Object.keys(folder.permissions).length - 3}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFolder(folder);
                      setShowPermissionModal(true);
                    }}
                  >
                    管理权限
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-accent-500 to-accent-600 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-accent-100 text-sm mb-1">总文档数</p>
              <p className="text-3xl font-bold">{totalDocuments}</p>
              <p className="text-accent-100 text-xs mt-2">+5 本周新增</p>
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
              <p className="text-primary-100 text-xs mt-2">{completedTasks}/{totalTasks} 已完成</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-success-500 to-success-600 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-success-100 text-sm mb-1">会议数</p>
              <p className="text-3xl font-bold">{totalSchedules}</p>
              <p className="text-success-100 text-xs mt-2">本周安排</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-warning-500 to-warning-600 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-warning-100 text-sm mb-1">团队成员</p>
              <p className="text-3xl font-bold">{totalMembers}</p>
              <p className="text-warning-100 text-xs mt-2">人活跃中</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-display font-semibold text-primary-800 mb-4">活跃度趋势</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTrendData}>
                <defs>
                  <linearGradient id="colorDoc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTask" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2EC4B6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2EC4B6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorComment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF5" />
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
                <Area type="monotone" dataKey="文档" stroke="#FF6B35" fill="url(#colorDoc)" strokeWidth={2} />
                <Area type="monotone" dataKey="任务" stroke="#2EC4B6" fill="url(#colorTask)" strokeWidth={2} />
                <Area type="monotone" dataKey="评论" stroke="#1E3A5F" fill="url(#colorComment)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-primary-800 mb-4">活动类型分布</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {activityTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {activityTypeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-primary-600">{item.name}</span>
                </div>
                <span className="text-primary-400">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-display font-semibold text-primary-800 mb-4">成员贡献排行</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={memberContributionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF5" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#7699C0', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#7699C0', fontSize: 12 }} width={60} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(30, 58, 95, 0.12)',
                }}
              />
              <Bar dataKey="文档" fill="#FF6B35" radius={[0, 4, 4, 0]} />
              <Bar dataKey="任务" fill="#2EC4B6" radius={[0, 4, 4, 0]} />
              <Bar dataKey="评论" fill="#1E3A5F" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-display font-semibold text-primary-800 mb-4">最近活动</h3>
        <div className="space-y-4">
          {activities.slice(0, 8).map((activity, index) => {
            const user = getUserById(activity.userId);
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-start gap-3"
              >
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-primary-700">
                    <span className="font-medium text-primary-800">{user?.name}</span>{' '}
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" size="sm">
                      {activity.targetType}
                    </Badge>
                    <span className="text-xs text-primary-400">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 h-full flex flex-col"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-2xl font-display font-bold text-primary-800">管理中心</h1>
        <p className="text-primary-500 mt-1">管理团队空间、成员权限和查看活跃度统计</p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-1 mb-6 bg-primary-50 rounded-xl p-1 w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-primary-800 shadow'
                  : 'text-primary-500 hover:text-primary-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="flex-1 min-h-0 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'spaces' && renderSpacesTab()}
            {activeTab === 'members' && renderMembersTab()}
            {activeTab === 'permissions' && renderPermissionsTab()}
            {activeTab === 'activity' && renderActivityTab()}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <Modal
        isOpen={showNewSpaceModal}
        onClose={() => setShowNewSpaceModal(false)}
        title="新建空间"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowNewSpaceModal(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSpace}>
              创建
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              空间名称
            </label>
            <input
              type="text"
              value={newSpace.name}
              onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
              placeholder="输入空间名称..."
              className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSpace()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              空间描述
            </label>
            <textarea
              value={newSpace.description}
              onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
              placeholder="添加空间描述..."
              className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              主题颜色
            </label>
            <div className="flex gap-2">
              {['#1E3A5F', '#FF6B35', '#2EC4B6', '#FFB627', '#6366F1', '#EC4899'].map(color => (
                <button
                  key={color}
                  onClick={() => setNewSpace({ ...newSpace, color })}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                    newSpace.color === color ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        title="添加成员"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowMemberModal(false)}>
              取消
            </Button>
            <Button onClick={() => setShowMemberModal(false)}>
              添加
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              搜索成员
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
              <input
                type="text"
                placeholder="输入姓名或邮箱..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-primary-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              选择角色
            </label>
            <div className="space-y-2">
              {Object.entries(roleConfig).map(([role, config]) => (
                <label
                  key={role}
                  className="flex items-center gap-3 p-3 rounded-lg border border-primary-100 hover:border-accent-200 cursor-pointer transition-colors"
                >
                  <input type="radio" name="role" value={role} className="accent-accent-500" />
                  <div>
                    <div className="font-medium text-primary-800">{config.label}</div>
                    <div className="text-xs text-primary-400">
                      {role === 'admin' && '拥有所有管理权限'}
                      {role === 'member' && '可以创建和编辑内容'}
                      {role === 'guest' && '只能查看内容'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        title={`${selectedFolder?.name} - 权限管理`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowPermissionModal(false)}>
              关闭
            </Button>
            <Button onClick={() => setShowPermissionModal(false)}>
              保存
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-primary-50 rounded-xl">
            <h4 className="font-medium text-primary-800 mb-2">文件夹信息</h4>
            <p className="text-sm text-primary-500">
              {selectedFolder?.name} · {spaces.find(s => s.id === selectedFolder?.spaceId)?.name}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-primary-800">成员权限</h4>
              <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                添加成员
              </Button>
            </div>

            <div className="space-y-2">
              {selectedFolder && Object.entries(selectedFolder.permissions).map(([userId, role]) => {
                const user = getUserById(userId);
                const roleValue = role as string;
                return (
                  <div key={userId} className="flex items-center justify-between p-3 bg-white border border-primary-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar src={user?.avatar} name={user?.name} size="sm" />
                      <div>
                        <div className="font-medium text-primary-800">{user?.name}</div>
                        <div className="text-xs text-primary-400">{user?.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={roleValue}
                        className="px-3 py-1.5 rounded-lg border border-primary-200 text-sm text-primary-700 focus:border-accent-400 outline-none bg-white"
                      >
                        {permissionLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                      <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {selectedFolder && Object.keys(selectedFolder.permissions).length === 0 && (
                <div className="text-center py-8 text-primary-400">
                  暂无成员权限设置
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-primary-100">
            <h4 className="font-medium text-primary-800 mb-3">权限说明</h4>
            <div className="space-y-2">
              {permissionLevels.map(level => (
                <div key={level.value} className="flex items-start gap-3 p-2">
                  <div className="w-2 h-2 rounded-full bg-primary-400 mt-1.5" />
                  <div>
                    <span className="font-medium text-primary-700">{level.label}：</span>
                    <span className="text-sm text-primary-500">{level.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
