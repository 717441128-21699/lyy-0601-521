import { create } from 'zustand';
import type { Task, TaskStatus, TaskPriority } from '../types';
import { mockTasks } from '../data/tasks';
import { currentUserId } from '../data/users';
import { loadFromStorage, saveToStorage } from '../utils/persist';

interface TaskState {
  tasks: Task[];
  filterStatus: TaskStatus | 'all';
  filterAssignee: string | 'all';
  filterPriority: TaskPriority | 'all';
  viewMode: 'kanban' | 'list';
  setFilterStatus: (status: TaskStatus | 'all') => void;
  setFilterAssignee: (userId: string | 'all') => void;
  setFilterPriority: (priority: TaskPriority | 'all') => void;
  setViewMode: (mode: 'kanban' | 'list') => void;
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

const STORAGE_KEY = 'task-store';

const getInitialState = (): {
  tasks: Task[];
  filterStatus: TaskStatus | 'all';
  filterAssignee: string | 'all';
  filterPriority: TaskPriority | 'all';
  viewMode: 'kanban' | 'list';
} => {
  const stored = loadFromStorage<{
    tasks: Task[];
    filterStatus: TaskStatus | 'all';
    filterAssignee: string | 'all';
    filterPriority: TaskPriority | 'all';
    viewMode: 'kanban' | 'list';
  } | null>(STORAGE_KEY, null);

  if (stored) {
    return stored;
  }

  return {
    tasks: mockTasks,
    filterStatus: 'all' as const,
    filterAssignee: 'all' as const,
    filterPriority: 'all' as const,
    viewMode: 'kanban' as const,
  };
};

const persistState = (state: Partial<TaskState>) => {
  const dataToPersist = {
    tasks: state.tasks!,
    filterStatus: state.filterStatus!,
    filterAssignee: state.filterAssignee!,
    filterPriority: state.filterPriority!,
    viewMode: state.viewMode!,
  };
  saveToStorage(STORAGE_KEY, dataToPersist);
};

export const useTaskStore = create<TaskState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,

    setFilterStatus: (status) => set((state) => {
      const newState = { filterStatus: status };
      persistState({ ...state, ...newState });
      return newState;
    }),

    setFilterAssignee: (userId) => set((state) => {
      const newState = { filterAssignee: userId };
      persistState({ ...state, ...newState });
      return newState;
    }),

    setFilterPriority: (priority) => set((state) => {
      const newState = { filterPriority: priority };
      persistState({ ...state, ...newState });
      return newState;
    }),

    setViewMode: (mode) => set((state) => {
      const newState = { viewMode: mode };
      persistState({ ...state, ...newState });
      return newState;
    }),

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
      set((state) => {
        const newState = { tasks: [...state.tasks, newTask] };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    updateTask: (id, data) => {
      set((state) => {
        const newState = {
          tasks: state.tasks.map(t =>
            t.id === id ? { ...t, ...data } : t
          ),
        };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    updateTaskStatus: (id, status) => {
      set((state) => {
        const newState = {
          tasks: state.tasks.map(t =>
            t.id === id ? { ...t, status } : t
          ),
        };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    deleteTask: (id) => {
      set((state) => {
        const newState = {
          tasks: state.tasks.filter(t => t.id !== id),
        };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    toggleSubTask: (taskId, subTaskId) => {
      set((state) => {
        const newState = {
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
        };
        persistState({ ...state, ...newState });
        return newState;
      });
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
  };
});
