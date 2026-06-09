import { create } from 'zustand';
import type { Message, MessageType } from '../types';
import { mockMessages } from '../data/messages';
import { currentUserId } from '../data/users';

interface MessageState {
  messages: Message[];
  filterType: MessageType | 'all';
  setFilterType: (type: MessageType | 'all') => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getMessagesByType: (type: MessageType | 'all') => Message[];
  getMyMessages: () => Message[];
  getUnreadCount: () => number;
  createMention: (mentionedUserId: string, content: string, relatedId: string, senderName: string) => void;
  createMessage: (data: Omit<Message, 'id' | 'createdAt'>) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: mockMessages,
  filterType: 'all',
  
  setFilterType: (type) => set({ filterType: type }),
  
  markAsRead: (id) => {
    set((state) => ({
      messages: state.messages.map(m =>
        m.id === id ? { ...m, isRead: true } : m
      ),
    }));
  },
  
  markAllAsRead: () => {
    set((state) => ({
      messages: state.messages.map(m =>
        m.receiverId === currentUserId ? { ...m, isRead: true } : m
      ),
    }));
  },
  
  getMessagesByType: (type) => {
    let messages = get().messages.filter(m => m.receiverId === currentUserId);
    if (type !== 'all') {
      messages = messages.filter(m => m.type === type);
    }
    return messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },
  
  getMyMessages: () => {
    return get().messages.filter(m => m.receiverId === currentUserId);
  },
  
  getUnreadCount: () => {
    return get().messages.filter(m => m.receiverId === currentUserId && !m.isRead).length;
  },
  
  createMention: (mentionedUserId, content, relatedId, senderName) => {
    const newMessage: Message = {
      id: generateId(),
      type: 'mention',
      title: '@你 在文档中',
      content: `${senderName} 在文档中 @了你：${content}`,
      receiverId: mentionedUserId,
      senderId: currentUserId,
      relatedId,
      isRead: false,
      createdAt: new Date(),
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
  },
  
  createMessage: (data) => {
    const newMessage: Message = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };
    set((state) => ({ messages: [...state.messages, newMessage] }));
  },
}));
