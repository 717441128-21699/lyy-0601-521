import { create } from 'zustand';
import type { User } from '../types';
import { mockUsers, currentUserId } from '../data/users';

interface AuthState {
  currentUser: User | null;
  users: User[];
  login: (email: string) => void;
  logout: () => void;
  getUserById: (id: string) => User | undefined;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: mockUsers.find(u => u.id === currentUserId) || null,
  users: mockUsers,
  login: (email: string) => {
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      set({ currentUser: user });
    }
  },
  logout: () => {
    set({ currentUser: null });
  },
  getUserById: (id: string) => {
    return get().users.find(u => u.id === id);
  },
}));
