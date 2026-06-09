import { create } from 'zustand';
import type { Schedule, Whiteboard, StickyNote } from '../types';
import { mockSchedules, mockWhiteboards, mockStickyNotes } from '../data/schedules';
import { currentUserId } from '../data/users';

interface ScheduleState {
  schedules: Schedule[];
  whiteboards: Whiteboard[];
  stickyNotes: StickyNote[];
  selectedDate: Date;
  viewMode: 'month' | 'week' | 'day';
  activeBoardId: string | null;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: 'month' | 'week' | 'day') => void;
  setActiveBoard: (id: string | null) => void;
  createSchedule: (data: Partial<Schedule>) => void;
  updateSchedule: (id: string, data: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  getSchedulesByDate: (date: Date) => Schedule[];
  getSchedulesByRange: (start: Date, end: Date) => Schedule[];
  getMySchedules: () => Schedule[];
  syncToCalendar: (scheduleId: string) => void;
  createWhiteboard: (data: Partial<Whiteboard>) => void;
  updateStickyNote: (id: string, data: Partial<StickyNote>) => void;
  addStickyNote: (data: Partial<StickyNote>) => void;
  deleteStickyNote: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: mockSchedules,
  whiteboards: mockWhiteboards,
  stickyNotes: mockStickyNotes,
  selectedDate: new Date(),
  viewMode: 'month',
  activeBoardId: 'wb1',
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveBoard: (id) => set({ activeBoardId: id }),
  
  createSchedule: (data) => {
    const newSchedule: Schedule = {
      id: generateId(),
      title: data.title || '新会议',
      description: data.description || '',
      startTime: data.startTime || new Date(),
      endTime: data.endTime || new Date(),
      room: data.room || '',
      creatorId: currentUserId,
      participantIds: data.participantIds || [],
      reminders: data.reminders || ['15'],
    };
    set((state) => ({ schedules: [...state.schedules, newSchedule] }));
  },
  
  updateSchedule: (id, data) => {
    set((state) => ({
      schedules: state.schedules.map(s =>
        s.id === id ? { ...s, ...data } : s
      ),
    }));
  },
  
  deleteSchedule: (id) => {
    set((state) => ({
      schedules: state.schedules.filter(s => s.id !== id),
    }));
  },
  
  getSchedulesByDate: (date) => {
    const dateStr = date.toDateString();
    return get().schedules.filter(s => s.startTime.toDateString() === dateStr);
  },
  
  getSchedulesByRange: (start, end) => {
    return get().schedules.filter(s => s.startTime >= start && s.endTime <= end);
  },
  
  getMySchedules: () => {
    return get().schedules.filter(s => s.participantIds.includes(currentUserId) || s.creatorId === currentUserId);
  },
  
  syncToCalendar: (scheduleId) => {
    const schedule = get().schedules.find(s => s.id === scheduleId);
    if (schedule) {
      alert(`已将「${schedule.title}」同步到日历！`);
    }
  },
  
  createWhiteboard: (data) => {
    const newBoard: Whiteboard = {
      id: generateId(),
      name: data.name || '新白板',
      spaceId: data.spaceId || 'space1',
      createdBy: currentUserId,
      createdAt: new Date(),
    };
    set((state) => ({ whiteboards: [...state.whiteboards, newBoard], activeBoardId: newBoard.id }));
  },
  
  updateStickyNote: (id, data) => {
    set((state) => ({
      stickyNotes: state.stickyNotes.map(sn =>
        sn.id === id ? { ...sn, ...data } : sn
      ),
    }));
  },
  
  addStickyNote: (data) => {
    const newNote: StickyNote = {
      id: generateId(),
      content: data.content || '',
      color: data.color || '#FFE082',
      x: data.x || 100,
      y: data.y || 100,
      width: data.width || 180,
      height: data.height || 100,
      boardId: data.boardId || get().activeBoardId || '',
      createdBy: currentUserId,
    };
    set((state) => ({ stickyNotes: [...state.stickyNotes, newNote] }));
  },
  
  deleteStickyNote: (id) => {
    set((state) => ({
      stickyNotes: state.stickyNotes.filter(sn => sn.id !== id),
    }));
  },
}));
