import type { Folder } from '../types';
import { useAuthStore } from '../store/useAuthStore';

export type PermissionRole = 'viewer' | 'editor' | 'manager';

const roleHierarchy: Record<PermissionRole, number> = {
  viewer: 1,
  editor: 2,
  manager: 3,
};

export const checkPermission = (
  userId: string,
  folder: Folder | null | undefined,
  requiredRole: PermissionRole
): boolean => {
  const currentUser = useAuthStore.getState().currentUser;
  
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  
  if (!folder) {
    return requiredRole === 'viewer' || requiredRole === 'editor';
  }
  
  const userRole = folder.permissions[userId] as PermissionRole | undefined;
  if (!userRole) return false;
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

export const canView = (userId: string, folder?: Folder | null): boolean => {
  return checkPermission(userId, folder, 'viewer');
};

export const canEdit = (userId: string, folder?: Folder | null): boolean => {
  return checkPermission(userId, folder, 'editor');
};

export const canManage = (userId: string, folder?: Folder | null): boolean => {
  return checkPermission(userId, folder, 'manager');
};

export const getRoleLabel = (role: PermissionRole): string => {
  const labels: Record<PermissionRole, string> = {
    viewer: '查看者',
    editor: '编辑者',
    manager: '管理者',
  };
  return labels[role];
};
