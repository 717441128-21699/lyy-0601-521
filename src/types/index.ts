export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'member' | 'guest';
  createdAt: Date;
}

export interface Space {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  color: string;
  isFavorite: boolean;
  createdAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  spaceId: string;
  parentId: string | null;
  order: number;
  permissions: Record<string, 'viewer' | 'editor' | 'manager'>;
}

export type BlockType = 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'table' | 'image' | 'code' | 'quote' | 'todo';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  children?: Block[];
  checked?: boolean;
  rows?: string[][];
}

export interface Document {
  id: string;
  title: string;
  content: Block[];
  folderId: string | null;
  spaceId: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  content: Block[];
  createdBy: string;
  remark: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  targetType: 'document' | 'task';
  targetId: string;
  selectionRange?: string;
  createdBy: string;
  isResolved: boolean;
  createdAt: Date;
  parentId?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SubTask {
  id: string;
  title: string;
  taskId: string;
  isCompleted: boolean;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  creatorId: string;
  documentId: string | null;
  dueDate: Date | null;
  subtasks: SubTask[];
  createdAt: Date;
}

export interface Schedule {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  room: string;
  creatorId: string;
  participantIds: string[];
  reminders: string[];
}

export type MessageType = 'mention' | 'comment' | 'task' | 'schedule' | 'system';

export interface Message {
  id: string;
  type: MessageType;
  title: string;
  content: string;
  receiverId: string;
  senderId: string;
  relatedId: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Whiteboard {
  id: string;
  name: string;
  spaceId: string;
  createdBy: string;
  createdAt: Date;
}

export interface StickyNote {
  id: string;
  content: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  boardId: string;
  createdBy: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'create' | 'edit' | 'comment' | 'complete';
  targetId: string;
  targetType: string;
  description: string;
  createdAt: Date;
}
