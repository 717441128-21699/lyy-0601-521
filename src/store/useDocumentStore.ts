import { create } from 'zustand';
import type { Space, Folder, Document, Block, DocumentVersion, Comment, Activity } from '../types';
import { mockSpaces, mockFolders, mockDocuments, mockVersions } from '../data/documents';
import { mockComments, mockActivities } from '../data/tasks';
import { currentUserId } from '../data/users';
import { loadFromStorage, saveToStorage } from '../utils/persist';

interface DocumentState {
  spaces: Space[];
  folders: Folder[];
  documents: Document[];
  versions: DocumentVersion[];
  comments: Comment[];
  activities: Activity[];
  activeSpaceId: string | null;
  activeDocumentId: string | null;
  activeFolderId: string | null;
  searchKeyword: string;
  setActiveSpace: (id: string | null) => void;
  setActiveDocument: (id: string | null) => void;
  setActiveFolder: (id: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  createSpace: (data: Partial<Space>) => void;
  createFolder: (data: Partial<Folder>) => void;
  createDocument: (data: Partial<Document>) => string;
  updateDocument: (id: string, content: Block[]) => void;
  updateDocumentTitle: (id: string, title: string) => void;
  saveVersion: (docId: string, remark: string) => void;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  resolveComment: (commentId: string) => void;
  convertParagraphToTask: (docId: string, blockId: string, title: string) => string;
  searchDocuments: (keyword: string) => Document[];
  toggleFavorite: (spaceId: string) => void;
  getDocumentsBySpace: (spaceId: string) => Document[];
  getDocumentsByFolder: (folderId: string | null) => Document[];
  getFoldersBySpace: (spaceId: string) => Folder[];
  getFoldersByParent: (spaceId: string, parentId: string | null) => Folder[];
  getVersionsByDocument: (docId: string) => DocumentVersion[];
  getCommentsByTarget: (targetType: 'document' | 'task', targetId: string) => Comment[];
  restoreVersion: (docId: string, versionId: string) => void;
  updateFolderPermissions: (folderId: string, permissions: Record<string, 'viewer' | 'editor' | 'manager'>) => void;
  getFolderById: (folderId: string) => Folder | undefined;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const STORAGE_KEY = 'document-store';

const getInitialState = () => {
  const stored = loadFromStorage<{
    spaces: Space[];
    folders: Folder[];
    documents: Document[];
    versions: DocumentVersion[];
    comments: Comment[];
    activities: Activity[];
  } | null>(STORAGE_KEY, null);

  if (stored) {
    return {
      spaces: stored.spaces,
      folders: stored.folders,
      documents: stored.documents,
      versions: stored.versions,
      comments: stored.comments,
      activities: stored.activities,
    };
  }

  return {
    spaces: mockSpaces,
    folders: mockFolders,
    documents: mockDocuments,
    versions: mockVersions,
    comments: mockComments,
    activities: mockActivities,
  };
};

const persistState = (state: Partial<DocumentState>) => {
  const dataToPersist = {
    spaces: state.spaces!,
    folders: state.folders!,
    documents: state.documents!,
    versions: state.versions!,
    comments: state.comments!,
    activities: state.activities!,
  };
  saveToStorage(STORAGE_KEY, dataToPersist);
};

export const useDocumentStore = create<DocumentState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    activeSpaceId: 'space1',
    activeDocumentId: 'doc1',
    activeFolderId: null,
    searchKeyword: '',

    setActiveSpace: (id) => set({ activeSpaceId: id, activeDocumentId: null }),
    setActiveDocument: (id) => set({ activeDocumentId: id }),
    setActiveFolder: (id) => set({ activeFolderId: id }),
    setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

    createSpace: (data) => {
      const newSpace: Space = {
        id: generateId(),
        name: data.name || '新空间',
        description: data.description || '',
        ownerId: currentUserId,
        color: data.color || '#1E3A5F',
        isFavorite: false,
        createdAt: new Date(),
      };
      set((state) => {
        const newState = { spaces: [...state.spaces, newSpace] };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    createFolder: (data) => {
      const newFolder: Folder = {
        id: generateId(),
        name: data.name || '新文件夹',
        spaceId: data.spaceId || get().activeSpaceId || '',
        parentId: data.parentId || null,
        order: get().folders.filter(f => f.spaceId === data.spaceId && f.parentId === data.parentId).length + 1,
        permissions: data.permissions || {},
      };
      set((state) => {
        const newState = { folders: [...state.folders, newFolder] };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    createDocument: (data) => {
      const newDoc: Document = {
        id: generateId(),
        title: data.title || '无标题文档',
        content: data.content || [{ id: generateId(), type: 'paragraph', content: '' }],
        folderId: data.folderId || get().activeFolderId,
        spaceId: data.spaceId || get().activeSpaceId || '',
        createdBy: currentUserId,
        updatedBy: currentUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      let docId = '';
      set((state) => {
        docId = newDoc.id;
        const newState = { documents: [...state.documents, newDoc], activeDocumentId: newDoc.id };
        persistState({ ...state, ...newState });
        return newState;
      });
      return docId;
    },

    updateDocument: (id, content) => {
      set((state) => {
        const newState = {
          documents: state.documents.map(d =>
            d.id === id ? { ...d, content, updatedBy: currentUserId, updatedAt: new Date() } : d
          ),
        };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    updateDocumentTitle: (id, title) => {
      set((state) => {
        const newState = {
          documents: state.documents.map(d =>
            d.id === id ? { ...d, title, updatedBy: currentUserId, updatedAt: new Date() } : d
          ),
        };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    saveVersion: (docId, remark) => {
      const doc = get().documents.find(d => d.id === docId);
      if (!doc) return;

      const newVersion: DocumentVersion = {
        id: generateId(),
        documentId: docId,
        content: JSON.parse(JSON.stringify(doc.content)),
        createdBy: currentUserId,
        remark,
        createdAt: new Date(),
      };
      set((state) => {
        const newState = { versions: [...state.versions, newVersion] };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    addComment: (comment) => {
      const newComment: Comment = {
        ...comment,
        id: generateId(),
        createdAt: new Date(),
      };
      set((state) => {
        const newState = { comments: [...state.comments, newComment] };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    resolveComment: (commentId) => {
      set((state) => {
        const newState = {
          comments: state.comments.map(c =>
            c.id === commentId ? { ...c, isResolved: true } : c
          ),
        };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    convertParagraphToTask: (docId, blockId, title) => {
      const taskId = generateId();
      const activity: Activity = {
        id: generateId(),
        userId: currentUserId,
        type: 'create',
        targetId: taskId,
        targetType: 'task',
        description: `从文档创建了任务「${title}」`,
        createdAt: new Date(),
      };
      set((state) => {
        const newState = { activities: [...state.activities, activity] };
        persistState({ ...state, ...newState });
        return newState;
      });
      return taskId;
    },

    searchDocuments: (keyword) => {
      if (!keyword.trim()) return [];
      const kw = keyword.toLowerCase();
      return get().documents.filter(d => {
        if (d.title.toLowerCase().includes(kw)) return true;
        for (const block of d.content) {
          if (block.content && block.content.toString().toLowerCase().includes(kw)) return true;
          if (block.type === 'table' && block.rows) {
            for (const row of block.rows) {
              for (const cell of row) {
                if (cell && cell.toLowerCase().includes(kw)) return true;
              }
            }
          }
        }
        return false;
      });
    },

    toggleFavorite: (spaceId) => {
      set((state) => {
        const newState = {
          spaces: state.spaces.map(s =>
            s.id === spaceId ? { ...s, isFavorite: !s.isFavorite } : s
          ),
        };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    getDocumentsBySpace: (spaceId) => {
      return get().documents.filter(d => d.spaceId === spaceId && d.folderId === null);
    },

    getDocumentsByFolder: (folderId) => {
      return get().documents.filter(d => d.folderId === folderId);
    },

    getFoldersBySpace: (spaceId) => {
      return get().folders.filter(f => f.spaceId === spaceId);
    },

    getFoldersByParent: (spaceId, parentId) => {
      return get().folders.filter(f => f.spaceId === spaceId && f.parentId === parentId);
    },

    getVersionsByDocument: (docId) => {
      return get().versions.filter(v => v.documentId === docId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },

    getCommentsByTarget: (targetType, targetId) => {
      return get().comments.filter(c => c.targetType === targetType && c.targetId === targetId);
    },

    restoreVersion: (docId, versionId) => {
      const version = get().versions.find(v => v.id === versionId);
      if (!version) return;

      set((state) => {
        const newState = {
          documents: state.documents.map(d =>
            d.id === docId
              ? { ...d, content: JSON.parse(JSON.stringify(version.content)), updatedBy: currentUserId, updatedAt: new Date() }
              : d
          ),
        };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    updateFolderPermissions: (folderId, permissions) => {
      set((state) => {
        const newState = {
          folders: state.folders.map(f =>
            f.id === folderId ? { ...f, permissions } : f
          ),
        };
        persistState({ ...state, ...newState });
        return newState;
      });
    },

    getFolderById: (folderId) => {
      return get().folders.find(f => f.id === folderId);
    },
  };
});
