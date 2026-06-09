import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AtSign,
  MessageSquare,
  CheckSquare,
  Calendar,
  Settings,
  Check,
  CheckCheck,
  Trash2,
  Search,
  Filter,
} from 'lucide-react';
import { useMessageStore } from '../store/useMessageStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatRelativeTime } from '../utils/date';
import type { MessageType } from '../types';

const messageTypeConfig: Record<MessageType | 'all', {
  icon: React.ElementType;
  label: string;
  color: string;
  activeColor: string;
}> = {
  all: { icon: Bell, label: '全部', color: 'text-primary-500', activeColor: 'text-primary-700' },
  mention: { icon: AtSign, label: '@提及', color: 'text-accent-500', activeColor: 'text-accent-700' },
  comment: { icon: MessageSquare, label: '评论', color: 'text-primary-500', activeColor: 'text-primary-700' },
  task: { icon: CheckSquare, label: '任务', color: 'text-success-500', activeColor: 'text-success-700' },
  schedule: { icon: Calendar, label: '日程', color: 'text-warning-500', activeColor: 'text-warning-700' },
  system: { icon: Settings, label: '系统', color: 'text-primary-500', activeColor: 'text-primary-700' },
};

export const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { messages, filterType, setFilterType, markAsRead, markAllAsRead, getMessagesByType, getUnreadCount } = useMessageStore();
  const { getUserById, currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredMessages = getMessagesByType(filterType).filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = getUnreadCount();
  const unreadByType: Record<string, number> = {};
  (['mention', 'comment', 'task', 'schedule', 'system'] as MessageType[]).forEach(type => {
    unreadByType[type] = messages.filter(m => m.receiverId === currentUser?.id && !m.isRead && m.type === type).length;
  });

  const handleMessageClick = (message: any) => {
    if (!message.isRead) {
      markAsRead(message.id);
    }
    if (message.relatedId) {
      if (message.type === 'task') {
        navigate('/tasks');
      } else if (message.type === 'schedule') {
        navigate('/schedule');
      } else if (message.relatedId.startsWith('doc')) {
        navigate('/documents');
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  };

  const renderMessageIcon = (type: MessageType) => {
    const Icon = messageTypeConfig[type].icon;
    const colorClass = messageTypeConfig[type].color;
    return <Icon className={`w-5 h-5 ${colorClass}`} />;
  };

  const getSender = (senderId: string) => {
    if (senderId === 'system') {
      return { name: '系统通知', avatar: undefined };
    }
    return getUserById(senderId) || { name: '未知用户', avatar: undefined };
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 h-full flex flex-col"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary-800">消息中心</h1>
          <p className="text-primary-500 mt-1">
            共 {filteredMessages.length} 条消息，{unreadCount} 条未读
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} leftIcon={<CheckCheck className="w-4 h-4" />}>
              全部已读
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-6 flex-1 min-h-0">
        <div className="w-64 flex-shrink-0 space-y-1">
          <div className="relative mb-4">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="w-4 h-4 text-primary-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索消息..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-primary-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none text-sm"
            />
          </div>

          {(Object.keys(messageTypeConfig) as (MessageType | 'all')[]).map((type) => {
            const config = messageTypeConfig[type];
            const count = type === 'all' ? unreadCount : unreadByType[type] || 0;
            const Icon = config.icon;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  filterType === type
                    ? 'bg-accent-50 text-accent-700 font-medium'
                    : 'hover:bg-primary-50 text-primary-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left">{config.label}</span>
                {count > 0 && (
                  <Badge variant={type === 'mention' ? 'accent' : 'default'} size="sm" className="!rounded-full">
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 bg-white rounded-xl border border-primary-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-primary-100 flex items-center justify-between">
            <h2 className="font-display font-semibold text-primary-800">
              {messageTypeConfig[filterType].label}消息
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4 text-primary-500" />
                </button>
                <AnimatePresence>
                  {showFilterMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-float border border-primary-100 py-2 z-50"
                    >
                      <button
                        onClick={() => {
                          markAllAsRead();
                          setShowFilterMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-primary-50 text-sm text-primary-700 flex items-center gap-2"
                      >
                        <CheckCheck className="w-4 h-4" />
                        全部标记已读
                      </button>
                      <button
                        onClick={() => setShowFilterMenu(false)}
                        className="w-full px-4 py-2 text-left hover:bg-primary-50 text-sm text-red-500 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        清空已读消息
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {filteredMessages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center p-12 text-center"
                >
                  <Bell className="w-16 h-16 text-primary-200 mb-4" />
                  <p className="text-primary-400 text-lg">暂无消息</p>
                  <p className="text-primary-300 text-sm mt-1">
                    {searchQuery ? '没有找到匹配的消息' : '您还没有收到任何消息'}
                  </p>
                </motion.div>
              ) : (
                filteredMessages.map((message, index) => {
                  const sender = getSender(message.senderId);
                  return (
                    <motion.div
                      key={message.id}
                      variants={itemVariants}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleMessageClick(message)}
                      className={`p-4 border-b border-primary-50 cursor-pointer transition-all hover:bg-accent-50/30 ${
                        !message.isRead ? 'bg-primary-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          {sender.avatar ? (
                            <Avatar src={sender.avatar} name={sender.name} size="md" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                              {renderMessageIcon(message.type)}
                            </div>
                          )}
                          {!message.isRead && (
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent-500 border-2 border-white rounded-full" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-primary-800">
                                {sender.name}
                              </span>
                              <Badge
                                variant={message.type === 'mention' ? 'accent' : 'default'}
                                size="sm"
                              >
                                {messageTypeConfig[message.type].label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-xs text-primary-400">
                                {formatRelativeTime(message.createdAt)}
                              </span>
                              {message.isRead && (
                                <Check className="w-4 h-4 text-success-500" />
                              )}
                            </div>
                          </div>

                          <h3 className={`font-medium mt-1 ${
                            !message.isRead ? 'text-primary-800' : 'text-primary-600'
                          }`}>
                            {message.title}
                          </h3>
                          <p className={`text-sm mt-0.5 line-clamp-2 ${
                            !message.isRead ? 'text-primary-600' : 'text-primary-500'
                          }`}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
