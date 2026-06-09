import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Bell,
  RefreshCw,
  MoreHorizontal,
  X,
  Check,
} from 'lucide-react';
import { useScheduleStore } from '../store/useScheduleStore';
import { useAuthStore } from '../store/useAuthStore';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatDate, formatTime, formatDateLabel, getWeekDays, getMonthDays } from '../utils/date';
import type { Schedule as ScheduleType } from '../types';

const weekDayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

interface ScheduleDetailModalProps {
  schedule: ScheduleType | null;
  isOpen: boolean;
  onClose: () => void;
}

const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({ schedule, isOpen, onClose }) => {
  const { updateSchedule, deleteSchedule, syncToCalendar } = useScheduleStore();
  const { users, getUserById } = useAuthStore();

  if (!schedule) return null;

  const creator = getUserById(schedule.creatorId);
  const participants = schedule.participantIds.map(id => getUserById(id)).filter(Boolean);

  const handleDelete = () => {
    if (confirm('确定要删除这个日程吗？')) {
      deleteSchedule(schedule.id);
      onClose();
    }
  };

  const handleSync = () => {
    syncToCalendar(schedule.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <Badge variant="accent" size="sm">会议</Badge>
        </div>
      }
      footer={
        <div className="flex justify-between w-full">
          <Button variant="ghost" onClick={handleDelete} className="text-red-500 hover:text-red-600">
            删除日程
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSync} leftIcon={<RefreshCw className="w-4 h-4" />}>
              同步日历
            </Button>
            <Button variant="ghost" onClick={onClose}>
              关闭
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-primary-800">{schedule.title}</h2>
          <p className="text-sm text-primary-400 mt-2">
            由 {creator?.name} 创建
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-xl">
            <Calendar className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-primary-500">日期</p>
              <p className="font-medium text-primary-800">{formatDate(schedule.startTime)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-xl">
            <Clock className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-primary-500">时间</p>
              <p className="font-medium text-primary-800">
                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-xl">
            <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-primary-500">地点</p>
              <p className="font-medium text-primary-800">{schedule.room || '未设置'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-xl">
            <Bell className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-primary-500">提醒</p>
              <p className="font-medium text-primary-800">
                {schedule.reminders.length > 0
                  ? schedule.reminders.map(r => `${r}分钟前`).join('、')
                  : '无提醒'}
              </p>
            </div>
          </div>
        </div>

        {schedule.description && (
          <div className="space-y-2">
            <h3 className="font-medium text-primary-800">描述</h3>
            <p className="text-primary-600 p-4 bg-primary-50/50 rounded-xl">
              {schedule.description}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-medium text-primary-800 flex items-center gap-2">
            <Users className="w-4 h-4" />
            参会人员 ({participants.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {participants.map((user, index) => (
              user && (
                <div key={index} className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-full">
                  <Avatar src={user.avatar} name={user.name} size="xs" />
                  <span className="text-sm text-primary-700">{user.name}</span>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const SchedulePage: React.FC = () => {
  const {
    schedules,
    selectedDate,
    viewMode,
    setSelectedDate,
    setViewMode,
    createSchedule,
    getSchedulesByDate,
    getMySchedules,
  } = useScheduleStore();
  const { users, currentUser } = useAuthStore();

  const [showNewScheduleModal, setShowNewScheduleModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(Date.now() + 60 * 60 * 1000),
    room: '',
    participantIds: [] as string[],
    reminders: ['15'] as string[],
  });

  const weekDays = getWeekDays(selectedDate);
  const monthDays = getMonthDays(selectedDate);
  const mySchedules = getMySchedules();

  const navigatePrev = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setSelectedDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const navigateToday = () => {
    setSelectedDate(new Date());
  };

  const handleCreateSchedule = () => {
    if (newSchedule.title.trim()) {
      createSchedule(newSchedule);
      setNewSchedule({
        title: '',
        description: '',
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
        room: '',
        participantIds: [],
        reminders: ['15'],
      });
      setShowNewScheduleModal(false);
    }
  };

  const openScheduleDetail = (schedule: ScheduleType) => {
    setSelectedSchedule(schedule);
    setShowDetailModal(true);
  };

  const toggleParticipant = (userId: string) => {
    setNewSchedule(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(userId)
        ? prev.participantIds.filter(id => id !== userId)
        : [...prev.participantIds, userId],
    }));
  };

  const toggleReminder = (minutes: string) => {
    setNewSchedule(prev => ({
      ...prev,
      reminders: prev.reminders.includes(minutes)
        ? prev.reminders.filter(r => r !== minutes)
        : [...prev.reminders, minutes],
    }));
  };

  const getHeaderTitle = () => {
    if (viewMode === 'month') {
      return `${selectedDate.getFullYear()}年 ${monthNames[selectedDate.getMonth()]}`;
    } else if (viewMode === 'week') {
      const start = weekDays[0];
      const end = weekDays[6];
      if (start.getMonth() === end.getMonth()) {
        return `${selectedDate.getFullYear()}年 ${monthNames[start.getMonth()]} ${start.getDate()}日 - ${end.getDate()}日`;
      }
      return `${formatDate(start)} - ${formatDate(end)}`;
    }
    return formatDateLabel(selectedDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === selectedDate.getMonth();
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

  const renderMonthView = () => (
    <div className="bg-white rounded-xl border border-primary-100 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-primary-100">
        {weekDayNames.map((day, index) => (
          <div
            key={day}
            className={`py-3 text-center text-sm font-medium ${
              index >= 5 ? 'text-warning-500' : 'text-primary-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthDays.map((date, index) => {
          const daySchedules = getSchedulesByDate(date);
          return (
            <div
              key={index}
              onClick={() => setSelectedDate(date)}
              className={`min-h-[100px] p-2 border-b border-r border-primary-100 cursor-pointer transition-colors hover:bg-accent-50/30 ${
                !isCurrentMonth(date) ? 'bg-primary-50/30' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${
                    isToday(date)
                      ? 'bg-accent-500 text-white font-bold'
                      : isSelected(date)
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : isCurrentMonth(date)
                      ? 'text-primary-700'
                      : 'text-primary-300'
                  }`}
                >
                  {date.getDate()}
                </span>
                {daySchedules.length > 0 && (
                  <Badge variant="accent" size="sm">{daySchedules.length}</Badge>
                )}
              </div>
              <div className="space-y-1">
                {daySchedules.slice(0, 2).map(schedule => (
                  <div
                    key={schedule.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      openScheduleDetail(schedule);
                    }}
                    className="text-xs p-1.5 rounded bg-accent-50 text-accent-700 truncate hover:bg-accent-100 transition-colors"
                  >
                    <span className="font-medium">{formatTime(schedule.startTime)}</span>
                    {' '}{schedule.title}
                  </div>
                ))}
                {daySchedules.length > 2 && (
                  <div className="text-xs text-primary-400 pl-1">
                    +{daySchedules.length - 2} 更多
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="bg-white rounded-xl border border-primary-100 overflow-hidden">
      <div className="grid grid-cols-8 border-b border-primary-100">
        <div className="py-3 text-center text-sm font-medium text-primary-400 border-r border-primary-100">
          时间
        </div>
        {weekDays.map((day, index) => (
          <div
            key={index}
            onClick={() => setSelectedDate(day)}
            className={`py-3 text-center cursor-pointer transition-colors hover:bg-primary-50 ${
              index >= 5 ? 'text-warning-500' : 'text-primary-500'
            } ${isSelected(day) ? 'bg-accent-50' : ''}`}
          >
            <div className="text-sm font-medium">{weekDayNames[index]}</div>
            <div
              className={`w-7 h-7 mx-auto flex items-center justify-center rounded-full text-sm mt-1 ${
                isToday(day)
                  ? 'bg-accent-500 text-white font-bold'
                  : isSelected(day)
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-primary-700'
              }`}
            >
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-8">
        {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
          <React.Fragment key={hour}>
            <div className="py-4 text-center text-xs text-primary-400 border-b border-r border-primary-100">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {weekDays.map((day, dayIndex) => {
              const daySchedules = getSchedulesByDate(day).filter(s =>
                s.startTime.getHours() === hour
              );
              return (
                <div
                  key={dayIndex}
                  className="py-2 px-1 border-b border-r border-primary-100 min-h-[60px]"
                >
                  {daySchedules.map(schedule => (
                    <div
                      key={schedule.id}
                      onClick={() => openScheduleDetail(schedule)}
                      className="text-xs p-2 rounded bg-accent-50 text-accent-700 cursor-pointer hover:bg-accent-100 transition-colors mb-1"
                    >
                      <div className="font-medium">{schedule.title}</div>
                      <div className="text-accent-500 text-[10px]">
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderDayView = () => {
    const daySchedules = getSchedulesByDate(selectedDate).sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );

    return (
      <div className="bg-white rounded-xl border border-primary-100 overflow-hidden">
        <div className="p-4 border-b border-primary-100">
          <h3 className="font-display font-semibold text-primary-800">
            {formatDateLabel(selectedDate)} 的日程
          </h3>
          <p className="text-sm text-primary-400 mt-1">
            共 {daySchedules.length} 个日程
          </p>
        </div>
        <div className="divide-y divide-primary-100">
          {daySchedules.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-primary-200 mx-auto mb-3" />
              <p className="text-primary-400">今天没有日程安排</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setShowNewScheduleModal(true)}
              >
                <Plus className="w-4 h-4 mr-1" /> 添加日程
              </Button>
            </div>
          ) : (
            daySchedules.map(schedule => {
              const participants = schedule.participantIds.map(id =>
                users.find(u => u.id === id)
              ).filter(Boolean);
              return (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => openScheduleDetail(schedule)}
                  className="p-4 hover:bg-accent-50/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-center min-w-[80px]">
                      <p className="text-lg font-bold text-primary-800">
                        {formatTime(schedule.startTime)}
                      </p>
                      <p className="text-xs text-primary-400">
                        {formatTime(schedule.endTime)}
                      </p>
                    </div>
                    <div className="w-1 h-full min-h-[60px] bg-accent-400 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-primary-800">{schedule.title}</h4>
                      {schedule.description && (
                        <p className="text-sm text-primary-500 mt-1 line-clamp-2">
                          {schedule.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        {schedule.room && (
                          <div className="flex items-center gap-1 text-xs text-primary-400">
                            <MapPin className="w-3.5 h-3.5" />
                            {schedule.room}
                          </div>
                        )}
                        {participants.length > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="flex -space-x-2">
                              {participants.slice(0, 3).map((p, i) => (
                                p && (
                                  <Avatar
                                    key={i}
                                    src={p.avatar}
                                    name={p.name}
                                    size="xs"
                                    className="z-10"
                                  />
                                )
                              ))}
                            </div>
                            {participants.length > 3 && (
                              <span className="text-xs text-primary-400 ml-1">
                                +{participants.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    );
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
          <h1 className="text-2xl font-display font-bold text-primary-800">日程管理</h1>
          <p className="text-primary-500 mt-1">共 {mySchedules.length} 个日程</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-primary-50 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-md text-sm transition-all ${
                  viewMode === mode
                    ? 'bg-white shadow text-primary-700 font-medium'
                    : 'text-primary-400 hover:text-primary-600'
                }`}
              >
                {mode === 'month' ? '月' : mode === 'week' ? '周' : '日'}
              </button>
            ))}
          </div>

          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowNewScheduleModal(true)}>
            新建日程
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={navigatePrev}
            className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-primary-600" />
          </button>
          <button
            onClick={navigateToday}
            className="px-4 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            今天
          </button>
          <button
            onClick={navigateNext}
            className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-primary-600" />
          </button>
          <h2 className="ml-4 text-lg font-display font-semibold text-primary-800">
            {getHeaderTitle()}
          </h2>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex-1 min-h-0 overflow-auto">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </motion.div>

      <ScheduleDetailModal
        schedule={selectedSchedule}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />

      <Modal
        isOpen={showNewScheduleModal}
        onClose={() => setShowNewScheduleModal(false)}
        title="新建日程"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowNewScheduleModal(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSchedule}>
              创建
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              日程标题
            </label>
            <input
              type="text"
              value={newSchedule.title}
              onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
              placeholder="输入日程标题..."
              className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                开始时间
              </label>
              <input
                type="datetime-local"
                value={new Date(newSchedule.startTime.getTime() - newSchedule.startTime.getTimezoneOffset() * 60000)
                  .toISOString().slice(0, 16)}
                onChange={(e) => setNewSchedule({
                  ...newSchedule,
                  startTime: new Date(e.target.value),
                })}
                className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                结束时间
              </label>
              <input
                type="datetime-local"
                value={new Date(newSchedule.endTime.getTime() - newSchedule.endTime.getTimezoneOffset() * 60000)
                  .toISOString().slice(0, 16)}
                onChange={(e) => setNewSchedule({
                  ...newSchedule,
                  endTime: new Date(e.target.value),
                })}
                className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              地点
            </label>
            <input
              type="text"
              value={newSchedule.room}
              onChange={(e) => setNewSchedule({ ...newSchedule, room: e.target.value })}
              placeholder="会议室或线上会议链接..."
              className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              描述
            </label>
            <textarea
              value={newSchedule.description}
              onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
              placeholder="添加日程描述..."
              className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              参会人员
            </label>
            <div className="flex flex-wrap gap-2">
              {users.filter(u => u.id !== currentUser?.id).map(user => (
                <button
                  key={user.id}
                  onClick={() => toggleParticipant(user.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                    newSchedule.participantIds.includes(user.id)
                      ? 'bg-accent-100 text-accent-700'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  }`}
                >
                  {newSchedule.participantIds.includes(user.id) && (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <Avatar src={user.avatar} name={user.name} size="xs" />
                  {user.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              提醒设置
            </label>
            <div className="flex flex-wrap gap-2">
              {['5', '15', '30', '60', '1440'].map(minutes => (
                <button
                  key={minutes}
                  onClick={() => toggleReminder(minutes)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    newSchedule.reminders.includes(minutes)
                      ? 'bg-accent-100 text-accent-700'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  }`}
                >
                  {minutes === '1440' ? '1天前' : `${minutes}分钟前`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
