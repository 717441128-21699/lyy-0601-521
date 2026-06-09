import type { User } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: '陈明',
    email: 'chenming@team.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenming',
    role: 'admin',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: '张三',
    email: 'zhangsan@team.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    role: 'member',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: '李四',
    email: 'lisi@team.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    role: 'member',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: '王五',
    email: 'wangwu@team.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu',
    role: 'member',
    createdAt: new Date('2024-02-15'),
  },
  {
    id: '5',
    name: '赵六',
    email: 'zhaoliu@team.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoliu',
    role: 'guest',
    createdAt: new Date('2024-03-01'),
  },
];

export const currentUserId = '1';
