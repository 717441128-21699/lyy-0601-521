import { format, formatDistanceToNow, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: Date | null, fmt: string = 'yyyy-MM-dd'): string => {
  if (!date) return '-';
  return format(date, fmt, { locale: zhCN });
};

export const formatDateTime = (date: Date | null): string => {
  if (!date) return '-';
  return format(date, 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

export const formatTime = (date: Date | null): string => {
  if (!date) return '-';
  return format(date, 'HH:mm', { locale: zhCN });
};

export const formatRelativeTime = (date: Date | null): string => {
  if (!date) return '-';
  return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
};

export const formatDateLabel = (date: Date | null): string => {
  if (!date) return '-';
  if (isToday(date)) return '今天';
  if (isTomorrow(date)) return '明天';
  const diff = differenceInDays(date, new Date());
  if (diff === -1) return '昨天';
  if (diff < 7 && diff > 0) return `${diff}天后`;
  if (diff > -7 && diff < 0) return `${Math.abs(diff)}天前`;
  return formatDate(date);
};

export const isOverdue = (date: Date | null): boolean => {
  if (!date) return false;
  return isPast(date) && !isToday(date);
};

export const getWeekDays = (date: Date): Date[] => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay() + 1);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    days.push(d);
  }
  return days;
};

export const getMonthDays = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const endPadding = 42 - (startPadding + lastDay.getDate());
  
  const days: Date[] = [];
  
  for (let i = startPadding; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    days.push(d);
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  for (let i = 1; i <= endPadding; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};
