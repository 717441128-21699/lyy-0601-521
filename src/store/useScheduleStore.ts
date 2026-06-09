import { create } from 'zustand';
import type { Schedule, Whiteboard, StickyNote } from '../types';
import { mockSchedules, mockWhiteboards, mockStickyNotes } from '../data/schedules';
import { currentUserId } from '../data/users';
import { loadFromStorage, saveToStorage } from '../utils/persist';

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

const STORAGE_KEY = 'schedule-store';

const getInitialState = () => {
  const stored = loadFromStorage<{
    schedules: Schedule[];
    whiteboards: Whiteboard[];
    stickyNotes: StickyNote[];
  } | null>(STORAGE_KEY, null);

  if (stored) {
    return stored;
  }

  return {
    schedules: mockSchedules,
    whiteboards: mockWhiteboards,
    stickyNotes: mockStickyNotes,
  };
};

const persistState = (state: Partial<ScheduleState>) => {
  const dataToPersist = {
    schedules: state.schedules!,
    whiteboards: state.whiteboards!,
    stickyNotes: state.stickyNotes!,
  };
  saveToStorage(STORAGE_KEY, dataToPersist);
};

export const useScheduleStore = create<ScheduleState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
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
      set((state) => {
        const newState = { schedules: [...state.schedules, newSchedule] };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    updateSchedule: (id, data) => {
      set((state) => {
        const newState = {
          schedules: state.schedules.map(s =>
            s.id === id ? { ...s, ...data } : s
          ),
        };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    deleteSchedule: (id) => {
      set((state) => {
        const newState = {
          schedules: state.schedules.filter(s => s.id !== id),
        };
        persistState({ ...state, ...newState });
        return newState;
      });
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
      set((state) => {
        const newState = { whiteboards: [...state.whiteboards, newBoard], activeBoardId: newBoard.id };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    updateStickyNote: (id, data) => {
      set((state) => {
        const newState = {
          stickyNotes: state.stickyNotes.map(sn =>
            sn.id === id ? { ...sn, ...data } : sn
          ),
        };
        persistState({ ...state, ...newState });
        return newState;
      });
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
      set((state) => {
        const newState = { stickyNotes: [...state.stickyNotes, newNote] };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    deleteStickyNote: (id) => {
      set((state) => {
        const newState = {
          stickyNotes: state.stickyNotes.filter(sn => sn.id !== id),
        };
        persistState({ ...state, ...newState });
        return newState;
      });
    },
  };
});
