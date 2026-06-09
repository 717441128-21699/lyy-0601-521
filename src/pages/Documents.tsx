import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  FileDown,
  FileSpreadsheet,
  Folder,
  Star,
  MoreHorizontal,
  Plus,
  ChevronRight,
  ChevronDown,
  Search,
  History,
  MessageSquare,
  Download,
  CheckSquare,
  Table,
  Image,
  List,
  Code,
  Quote,
  GripVertical,
  X,
  Users,
  Clock,
  Check,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentStore } from '../store/useDocumentStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTaskStore } from '../store/useTaskStore';
import { useMessageStore } from '../store/useMessageStore';
import { formatDateTime, formatRelativeTime } from '../utils/date';
import { exportDocument } from '../utils/export';
import { canView, canEdit, canManage } from '../utils/permission';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import type { Block, BlockType } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const blockTypeOptions = [
  { type: 'paragraph' as BlockType, icon: FileText, label: '段落' },
  { type: 'heading1' as BlockType, icon: FileText, label: '一级标题' },
  { type: 'heading2' as BlockType, icon: FileText, label: '二级标题' },
  { type: 'heading3' as BlockType, icon: FileText, label: '三级标题' },
  { type: 'bulletList' as BlockType, icon: List, label: '无序列表' },
  { type: 'numberedList' as BlockType, icon: List, label: '有序列表' },
  { type: 'table' as BlockType, icon: Table, label: '表格' },
  { type: 'image' as BlockType, icon: Image, label: '图片' },
  { type: 'code' as BlockType, icon: Code, label: '代码块' },
  { type: 'quote' as BlockType, icon: Quote, label: '引用' },
  { type: 'todo' as BlockType, icon: CheckSquare, label: '待办事项' },
];

export const Documents: React.FC = () => {
  const { spaceId, docId } = useParams();
  const navigate = useNavigate();
  const {
    spaces,
    folders,
    documents,
    activeSpaceId,
    activeDocumentId,
    versions,
    comments,
    setActiveSpace,
    setActiveDocument,
    createSpace,
    createFolder,
    createDocument,
    updateDocument,
    updateDocumentTitle,
    saveVersion,
    addComment,
    resolveComment,
    convertParagraphToTask,
    toggleFavorite,
    getFoldersByParent,
    getDocumentsByFolder,
    getVersionsByDocument,
    getCommentsByTarget,
    restoreVersion,
    searchDocuments,
    setSearchKeyword,
    searchKeyword,
  } = useDocumentStore();
  const { currentUser, getUserById, users } = useAuthStore();
  const { createTask } = useTaskStore();
  const { createMention } = useMessageStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['folder1', 'folder2']));
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const currentSpaceId = spaceId || activeSpaceId || 'space1';
  const activeSpace = spaces.find(s => s.id === currentSpaceId);
  
  let activeDoc: typeof documents[0] | undefined;
  let docExists = true;
  let docBelongsToSpace = true;
  
  if (docId) {
    const foundDoc = documents.find(d => d.id === docId);
    if (!foundDoc) {
      docExists = false;
      activeDoc = undefined;
    } else if (foundDoc.spaceId !== currentSpaceId) {
      docBelongsToSpace = false;
      activeDoc = undefined;
    } else {
      activeDoc = foundDoc;
    }
  } else if (activeDocumentId) {
    const foundDoc = documents.find(d => d.id === activeDocumentId);
    if (foundDoc && foundDoc.spaceId === currentSpaceId) {
      activeDoc = foundDoc;
    } else {
      const defaultDoc = documents.find(d => d.spaceId === currentSpaceId && !d.folderId);
      if (defaultDoc) {
        const defaultFolder = defaultDoc.folderId ? folders.find(f => f.id === defaultDoc.folderId) : null;
        const canViewDefault = currentUser ? canView(currentUser.id, defaultFolder) : true;
        if (canViewDefault) {
          activeDoc = defaultDoc;
        } else {
          activeDoc = documents.find(d => {
            if (d.spaceId !== currentSpaceId) return false;
            const folder = d.folderId ? folders.find(f => f.id === d.folderId) : null;
            return currentUser ? canView(currentUser.id, folder) : true;
          });
        }
      }
    }
  } else {
    const defaultDoc = documents.find(d => d.spaceId === currentSpaceId && !d.folderId);
    if (defaultDoc) {
      const defaultFolder = defaultDoc.folderId ? folders.find(f => f.id === defaultDoc.folderId) : null;
      const canViewDefault = currentUser ? canView(currentUser.id, defaultFolder) : true;
      if (canViewDefault) {
        activeDoc = defaultDoc;
      } else {
        activeDoc = documents.find(d => {
          if (d.spaceId !== currentSpaceId) return false;
          const folder = d.folderId ? folders.find(f => f.id === d.folderId) : null;
          return currentUser ? canView(currentUser.id, folder) : true;
        });
      }
    }
  }
  
  const activeFolder = activeDoc?.folderId ? folders.find(f => f.id === activeDoc.folderId) : null;
  const currentDocId = activeDoc?.id || '';
  const docVersions = currentDocId ? getVersionsByDocument(currentDocId) : [];
  const docComments = currentDocId ? getCommentsByTarget('document', currentDocId) : [];
  const searchResults = searchKeyword ? searchDocuments(searchKeyword) : [];

  const canViewDoc = activeDoc && currentUser ? (activeFolder ? canView(currentUser.id, activeFolder) : true) : false;
  const canEditDoc = activeDoc && currentUser ? (activeFolder ? canEdit(currentUser.id, activeFolder) : true) : false;
  const canManageDoc = activeDoc && currentUser ? (activeFolder ? canManage(currentUser.id, activeFolder) : true) : false;

  useEffect(() => {
    if (spaceId && spaceId !== activeSpaceId) {
      setActiveSpace(spaceId);
    }
    if (docId) {
      const foundDoc = documents.find(d => d.id === docId);
      if (foundDoc && foundDoc.spaceId === (spaceId || currentSpaceId) && docId !== activeDocumentId) {
        setActiveDocument(docId);
      }
    }
  }, [spaceId, docId, activeSpaceId, activeDocumentId, documents, setActiveSpace, setActiveDocument, currentSpaceId]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleBlockChange = (blockId: string, content: string) => {
    if (!activeDoc) return;
    const newContent = activeDoc.content.map(block =>
      block.id === blockId ? { ...block, content } : block
    );
    updateDocument(currentDocId, newContent);
  };

  const handleBlockTypeChange = (blockId: string, newType: BlockType) => {
    if (!activeDoc) return;
    const newContent = activeDoc.content.map(block =>
      block.id === blockId ? { ...block, type: newType } : block
    );
    updateDocument(currentDocId, newContent);
    setShowBlockMenu(null);
  };

  const handleAddBlock = (afterBlockId: string) => {
    if (!activeDoc) return;
    const newBlock: Block = {
      id: generateId(),
      type: 'paragraph',
      content: '',
    };
    const index = activeDoc.content.findIndex(b => b.id === afterBlockId);
    const newContent = [
      ...activeDoc.content.slice(0, index + 1),
      newBlock,
      ...activeDoc.content.slice(index + 1),
    ];
    updateDocument(currentDocId, newContent);
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!activeDoc || activeDoc.content.length <= 1) return;
    const newContent = activeDoc.content.filter(b => b.id !== blockId);
    updateDocument(currentDocId, newContent);
  };

  const handleConvertToTask = (blockId: string) => {
    if (!activeDoc) return;
    const block = activeDoc.content.find(b => b.id === blockId);
    if (!block) return;
    const taskId = convertParagraphToTask(currentDocId, blockId, block.content);
    createTask({
      id: taskId,
      title: block.content,
      description: `从文档「${activeDoc.title}」转换而来`,
      documentId: currentDocId,
    });
    alert('已成功转换为任务！');
  };

  const handleSaveVersion = () => {
    if (!canEditDoc) {
      alert('您没有编辑权限，无法保存版本');
      return;
    }
    const remark = prompt('请输入版本备注：');
    if (remark !== null) {
      saveVersion(currentDocId, remark || '保存版本');
      setShowVersionModal(false);
      alert('版本保存成功！');
    }
  };

  const handleRestoreVersion = (versionId: string) => {
    if (!canEditDoc) {
      alert('您没有编辑权限，无法恢复版本');
      return;
    }
    if (confirm('确定要恢复到此版本吗？当前内容将被覆盖。')) {
      restoreVersion(currentDocId, versionId);
      setShowVersionModal(false);
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !currentUser) return;
    const mentionedUsers = commentText.match(/@(\S+)/g);
    if (mentionedUsers) {
      mentionedUsers.forEach(mention => {
        const userName = mention.slice(1);
        const mentionedUser = users.find(u => u.name.includes(userName));
        if (mentionedUser) {
          createMention(mentionedUser.id, commentText, currentDocId, currentUser.name);
        }
      });
    }
    addComment({
      content: commentText,
      targetType: 'document',
      targetId: currentDocId,
      selectionRange: selectedBlockId || '',
      createdBy: currentUser.id,
      isResolved: false,
    });
    setCommentText('');
    setSelectedBlockId(null);
  };

  const handleExport = async (format: 'md' | 'pdf' | 'docx') => {
    if (activeDoc) {
      await exportDocument(activeDoc, format);
    }
  };

  const renderBlock = (block: Block) => {
    const isSelected = selectedBlockId === block.id;
    const isMenuOpen = showBlockMenu === block.id;

    const renderBlockContent = () => {
      switch (block.type) {
        case 'heading1':
          return (
            <h1 className="text-3xl font-display font-bold text-primary-800">
              {block.content}
            </h1>
          );
        case 'heading2':
          return (
            <h2 className="text-2xl font-display font-semibold text-primary-800">
              {block.content}
            </h2>
          );
        case 'heading3':
          return (
            <h3 className="text-xl font-display font-semibold text-primary-700">
              {block.content}
            </h3>
          );
        case 'bulletList':
          return (
            <div className="flex gap-2">
              <span className="text-accent-500 mt-1">•</span>
              <span>{block.content}</span>
            </div>
          );
        case 'numberedList':
          return (
            <div className="flex gap-2">
              <span className="text-primary-500 font-medium min-w-[20px]">
                {activeDoc?.content.filter(b => b.type === 'numberedList').findIndex(b => b.id === block.id) + 1}.
              </span>
              <span>{block.content}</span>
            </div>
          );
        case 'todo':
          return (
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 cursor-pointer transition-colors ${
                  block.checked
                    ? 'bg-success-500 border-success-500'
                    : 'border-primary-300 hover:border-accent-500'
                }`}
                onClick={() => {
                  if (!activeDoc) return;
                  const newContent = activeDoc.content.map(b =>
                    b.id === block.id ? { ...b, checked: !b.checked } : b
                  );
                  updateDocument(currentDocId, newContent);
                }}
              >
                {block.checked && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={block.checked ? 'line-through text-primary-400' : ''}>
                {block.content}
              </span>
            </div>
          );
        case 'quote':
          return (
            <blockquote className="border-l-4 border-accent-500 pl-4 italic text-primary-600 bg-accent-50/30 py-2 pr-4 rounded-r-lg">
              {block.content}
            </blockquote>
          );
        case 'code':
          return (
            <pre className="bg-primary-800 text-white p-4 rounded-lg overflow-x-auto font-mono text-sm">
              <code>{block.content}</code>
            </pre>
          );
        case 'table':
          const rows = block.content.split('\n');
          const headers = rows[0]?.split('|') || [];
          return (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-primary-200 rounded-lg overflow-hidden">
                <thead className="bg-primary-50">
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i} className="border border-primary-200 px-4 py-2 text-left text-sm font-medium text-primary-700">
                        {h.trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(1).map((row, i) => (
                    <tr key={i} className="hover:bg-primary-50/50">
                      {row.split('|').map((cell, j) => (
                        <td key={j} className="border border-primary-200 px-4 py-2 text-sm">
                          {cell.trim()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        case 'image':
          return (
            <div className="rounded-lg overflow-hidden">
              <img
                src={block.content || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop'}
                alt="文档图片"
                className="w-full h-auto rounded-lg"
              />
            </div>
          );
        default:
          return <p>{block.content || <span className="text-primary-300">输入内容，或输入 "/" 选择块类型...</span>}</p>;
      }
    };

    return (
      <motion.div
        key={block.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group relative flex gap-2 py-1 px-2 -mx-2 rounded-lg transition-colors ${
          isSelected ? 'bg-accent-50/50' : 'hover:bg-primary-50/50'
        }`}
        onClick={() => setSelectedBlockId(block.id)}
      >
        {canEditDoc && (
          <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
            <button
              className="p-0.5 rounded hover:bg-primary-100 text-primary-400 hover:text-primary-600"
              onClick={(e) => {
                e.stopPropagation();
                setShowBlockMenu(isMenuOpen ? null : block.id);
              }}
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <button
              className="p-0.5 rounded hover:bg-primary-100 text-primary-400 hover:text-primary-600"
              onClick={(e) => {
                e.stopPropagation();
                handleAddBlock(block.id);
              }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div
            contentEditable={canEditDoc}
            suppressContentEditableWarning
            onBlur={(e) => canEditDoc && handleBlockChange(block.id, e.currentTarget.textContent || '')}
            className={`outline-none min-h-[1.5em] focus:bg-white rounded px-1 ${
              !canEditDoc ? 'cursor-default' : ''
            }`}
          >
            {renderBlockContent()}
          </div>

          {isMenuOpen && canEditDoc && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-float border border-primary-100 py-2 w-56"
            >
              <div className="px-3 py-1.5 text-xs font-medium text-primary-400 uppercase tracking-wider">
                转换为
              </div>
              {blockTypeOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBlockTypeChange(block.id, option.type);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  <option.icon className="w-4 h-4 text-primary-400" />
                  {option.label}
                </button>
              ))}
              <div className="border-t border-primary-100 my-2" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleConvertToTask(block.id);
                  setShowBlockMenu(null);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-accent-600 hover:bg-accent-50 transition-colors"
              >
                <CheckSquare className="w-4 h-4" />
                转换为任务
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBlock(block.id);
                  setShowBlockMenu(null);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4" />
                删除块
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderFolderTree = (spaceId: string, parentId: string | null, level: number = 0) => {
    const childFolders = getFoldersByParent(spaceId, parentId).filter(folder => 
      currentUser ? canView(currentUser.id, folder) : true
    );
    const docsInFolder = parentId !== null ? getDocumentsByFolder(spaceId, parentId).filter(doc => {
      const docFolder = doc.folderId ? folders.find(f => f.id === doc.folderId) : null;
      return currentUser ? canView(currentUser.id, docFolder) : true;
    }) : [];

    return (
      <>
        {childFolders.map((folder) => (
          <div key={folder.id}>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-primary-50 ${
                expandedFolders.has(folder.id) ? 'bg-primary-50/50' : ''
              }`}
              style={{ paddingLeft: `${12 + level * 16}px` }}
              onClick={() => toggleFolder(folder.id)}
            >
              {expandedFolders.has(folder.id) ? (
                <ChevronDown className="w-4 h-4 text-primary-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-primary-400" />
              )}
              <Folder className="w-4 h-4 text-warning-500" />
              <span className="text-sm text-primary-700 truncate">{folder.name}</span>
            </div>
            {expandedFolders.has(folder.id) && renderFolderTree(spaceId, folder.id, level + 1)}
          </div>
        ))}
        {docsInFolder.map((doc) => (
          <div
            key={doc.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              doc.id === currentDocId
                ? 'bg-accent-50 text-accent-700'
                : 'hover:bg-primary-50 text-primary-700'
            }`}
            style={{ paddingLeft: `${12 + level * 16}px` }}
            onClick={() => {
              setActiveDocument(doc.id);
              navigate(`/documents/${currentSpaceId}/${doc.id}`);
            }}
          >
            <FileText className={`w-4 h-4 ${doc.id === currentDocId ? 'text-accent-500' : 'text-primary-400'}`} />
            <span className="text-sm truncate">{doc.title}</span>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="h-full flex">
      <div className="w-72 bg-white border-r border-primary-100 flex flex-col">
        <div className="p-4 border-b border-primary-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
            <input
              type="text"
              placeholder="搜索文档..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-primary-50/50 border border-transparent rounded-lg text-sm placeholder:text-primary-400 focus:outline-none focus:bg-white focus:border-accent-300 focus:ring-2 focus:ring-accent-500/20 transition-all"
            />
          </div>
          {searchResults.filter(doc => {
            const docFolder = doc.folderId ? folders.find(f => f.id === doc.folderId) : null;
            return currentUser ? canView(currentUser.id, docFolder) : true;
          }).length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto">
              {searchResults.filter(doc => {
                const docFolder = doc.folderId ? folders.find(f => f.id === doc.folderId) : null;
                return currentUser ? canView(currentUser.id, docFolder) : true;
              }).map((doc) => (
                <div
                  key={doc.id}
                  className="p-2 rounded-lg hover:bg-primary-50 cursor-pointer text-sm"
                  onClick={() => {
                    setActiveDocument(doc.id);
                    navigate(`/documents/${doc.spaceId}/${doc.id}`);
                    setSearchKeyword('');
                  }}
                >
                  <p className="font-medium text-primary-700">{doc.title}</p>
                  <p className="text-xs text-primary-400">{spaces.find(s => s.id === doc.spaceId)?.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-b border-primary-100">
          <p className="px-2 text-xs font-medium text-primary-400 uppercase tracking-wider mb-2">
            我的空间
          </p>
          <div className="space-y-1">
            {spaces.map((space) => (
              <div
                key={space.id}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors group ${
                  space.id === currentSpaceId ? 'bg-primary-50' : 'hover:bg-primary-50/50'
                }`}
                onClick={() => {
                  setActiveSpace(space.id);
                  setActiveDocument(null);
                  navigate(`/documents/${space.id}`);
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: space.color }}
                />
                <span className="text-sm text-primary-700 flex-1 truncate">{space.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(space.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white"
                >
                  <Star className={`w-3.5 h-3.5 ${
                    space.isFavorite ? 'text-warning-500 fill-warning-500' : 'text-primary-400'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
          {currentSpaceId && renderFolderTree(currentSpaceId, null)}
          {currentSpaceId && getDocumentsByFolder(currentSpaceId, null).filter(doc => {
            const docFolder = doc.folderId ? folders.find(f => f.id === doc.folderId) : null;
            return currentUser ? canView(currentUser.id, docFolder) : true;
          }).map((doc) => (
            <div
              key={doc.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                doc.id === currentDocId
                  ? 'bg-accent-50 text-accent-700'
                  : 'hover:bg-primary-50 text-primary-700'
              }`}
              onClick={() => {
                setActiveDocument(doc.id);
                navigate(`/documents/${currentSpaceId}/${doc.id}`);
              }}
            >
              <FileText className={`w-4 h-4 ${doc.id === currentDocId ? 'text-accent-500' : 'text-primary-400'}`} />
              <span className="text-sm truncate">{doc.title}</span>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-primary-100 space-y-2">
          {canEditDoc && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => {
                const title = prompt('请输入文档标题：');
                if (title) {
                  const newDocId = createDocument({ title, spaceId: currentSpaceId });
                  if (newDocId) {
                    navigate(`/documents/${currentSpaceId}/${newDocId}`);
                  }
                }
              }}
              >
                新建文档
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                leftIcon={<Folder className="w-4 h-4" />}
                onClick={() => {
                  const name = prompt('请输入文件夹名称：');
                  if (name) {
                    createFolder({ name, spaceId: currentSpaceId });
                  }
                }}
              >
                新建文件夹
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {docExists && docBelongsToSpace && canViewDoc && (
          <div className="h-14 bg-white border-b border-primary-100 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: activeSpace?.color || '#1E3A5F' }}
              />
              <span className="text-sm text-primary-500">{activeSpace?.name}</span>
              <ChevronRight className="w-4 h-4 text-primary-300" />
              <input
                type="text"
                value={activeDoc?.title || ''}
                onChange={(e) => canEditDoc && updateDocumentTitle(currentDocId, e.target.value)}
                disabled={!canEditDoc}
                className={`text-lg font-display font-semibold bg-transparent border-none outline-none focus:ring-0 ${
                  canEditDoc ? 'text-primary-800' : 'text-primary-500 cursor-not-allowed'
                }`}
              />
              {activeDoc?.updatedAt && (
                <span className="text-xs text-primary-400 ml-4">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  {formatRelativeTime(activeDoc.updatedAt)}
                </span>
              )}
              {activeFolder && currentUser && (
                <Badge variant={canManageDoc ? 'success' : canEditDoc ? 'accent' : 'default'} size="sm" className="ml-3">
                  {canManageDoc ? '管理者' : canEditDoc ? '编辑者' : '查看者'}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-2">
                <Avatar src={getUserById('2')?.avatar} name="张三" size="xs" />
                <Avatar src={getUserById('3')?.avatar} name="李四" size="xs" className="-ml-1" />
                <div className="w-6 h-6 rounded-full bg-accent-100 text-accent-600 text-xs flex items-center justify-center -ml-1 font-medium">
                  +2
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<History className="w-4 h-4" />}
                onClick={() => setShowVersionModal(true)}
              >
                版本历史
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<MessageSquare className="w-4 h-4" />}
                onClick={() => setShowCommentModal(true)}
              >
                评论 ({docComments.length})
              </Button>
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                  rightIcon={<ChevronDown className="w-4 h-4" />}
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  导出
                </Button>
                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-float border border-primary-100 py-1 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={async () => {
                          await handleExport('md');
                          setShowExportMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-primary-700 hover:bg-primary-50 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Markdown (.md)
                      </button>
                      <button
                        onClick={async () => {
                          await handleExport('pdf');
                          setShowExportMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-primary-700 hover:bg-primary-50 flex items-center gap-2"
                      >
                        <FileDown className="w-4 h-4" />
                        PDF (.pdf)
                      </button>
                      <button
                        onClick={async () => {
                          await handleExport('docx');
                          setShowExportMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-primary-700 hover:bg-primary-50 flex items-center gap-2"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Word (.doc)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {canEditDoc && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckSquare className="w-4 h-4" />}
                  onClick={() => {
                    if (activeDoc) {
                      const title = prompt('请输入任务标题：', activeDoc.title);
                      if (title) {
                        createTask({ title, documentId: currentDocId });
                        alert('任务创建成功！');
                      }
                    }
                  }}
                >
                  创建任务
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-thin bg-white">
          {!docExists ? (
            <div className="flex-1 flex flex-col items-center justify-center h-full p-12 text-center">
              <FileText className="w-16 h-16 text-primary-200 mb-4" />
              <p className="text-primary-500 text-lg mb-2">文档不存在或已被删除</p>
              <p className="text-primary-400 text-sm mb-6">您访问的文档链接无效，请返回文档列表</p>
              <Button
                variant="primary"
                onClick={() => navigate('/documents')}
              >
                返回文档列表
              </Button>
            </div>
          ) : !docBelongsToSpace ? (
            <div className="flex-1 flex flex-col items-center justify-center h-full p-12 text-center">
              <AlertCircle className="w-16 h-16 text-primary-200 mb-4" />
              <p className="text-primary-500 text-lg mb-2">文档不属于当前空间</p>
              <p className="text-primary-400 text-sm mb-6">该文档不在此空间中，请检查链接是否正确</p>
              <Button
                variant="primary"
                onClick={() => navigate('/documents')}
              >
                返回文档列表
              </Button>
            </div>
          ) : !canViewDoc ? (
            <div className="flex-1 flex flex-col items-center justify-center h-full p-12 text-center">
              <Lock className="w-16 h-16 text-primary-200 mb-4" />
              <p className="text-primary-500 text-lg mb-2">您没有权限查看此文档</p>
              <p className="text-primary-400 text-sm mb-6">请联系文件夹管理员获取访问权限</p>
              <Button
                variant="primary"
                onClick={() => navigate('/documents')}
              >
                返回文档列表
              </Button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto py-12 px-8">
              <AnimatePresence>
                {activeDoc?.content.map((block) => renderBlock(block))}
              </AnimatePresence>
              {canEditDoc && (
                <button
                  onClick={() => activeDoc && handleAddBlock(activeDoc.content[activeDoc.content.length - 1].id)}
                  className="mt-4 flex items-center gap-2 px-3 py-2 text-primary-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">添加新块</span>
                </button>
              )}
              {!canEditDoc && activeFolder && (
                <div className="mt-8 p-4 bg-primary-50 rounded-xl text-center">
                  <Lock className="w-8 h-8 text-primary-300 mx-auto mb-2" />
                  <p className="text-sm text-primary-500">您只有查看权限，无法编辑此文档</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showVersionModal}
        onClose={() => setShowVersionModal(false)}
        title="版本历史"
        size="lg"
        footer={
          canEditDoc ? (
            <Button variant="primary" onClick={handleSaveVersion}>
              保存当前版本
            </Button>
          ) : null
        }
      >
        <div className="space-y-3">
          {docVersions.length === 0 ? (
            <p className="text-center text-primary-400 py-8">暂无历史版本</p>
          ) : (
            docVersions.map((version, index) => {
              const creator = getUserById(version.createdBy);
              return (
                <div
                  key={version.id}
                  className="p-4 rounded-xl border border-primary-100 hover:border-accent-200 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar src={creator?.avatar} name={creator?.name} size="sm" />
                      <div>
                        <p className="font-medium text-primary-800">
                          {creator?.name}
                        </p>
                        <p className="text-sm text-primary-500">
                          {formatDateTime(version.createdAt)}
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <Badge variant="accent" size="sm">当前版本</Badge>
                    )}
                  </div>
                  <p className="text-sm text-primary-600 mt-2">{version.remark}</p>
                  {index > 0 && canEditDoc && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRestoreVersion(version.id)}
                      >
                        恢复此版本
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                      >
                        对比
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        title="文档评论"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-3">
            <Avatar src={currentUser?.avatar} name={currentUser?.name} size="sm" />
            <div className="flex-1">
              <div className="relative">
                <textarea
                  value={commentText}
                  onChange={(e) => {
                    setCommentText(e.target.value);
                    if (e.target.value.endsWith('@')) {
                      setShowMentionMenu(true);
                    } else {
                      setShowMentionMenu(false);
                    }
                  }}
                  placeholder="添加评论，输入 @ 提及成员..."
                  className="w-full p-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 resize-none"
                  rows={3}
                />
                {showMentionMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-xl shadow-float border border-primary-100 py-2 z-50 max-h-48 overflow-y-auto">
                    {users
                      .filter(u => u.name.toLowerCase().includes(mentionSearch.toLowerCase()))
                      .map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            setCommentText(prev => prev.replace(/@$/, `@${user.name} `));
                            setShowMentionMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-primary-700 hover:bg-primary-50"
                        >
                          <Avatar src={user.avatar} name={user.name} size="xs" />
                          <div className="text-left">
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-primary-400">{user.role}</p>
                          </div>
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
              <div className="mt-2 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                >
                  发表评论
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-100 pt-4 space-y-4 max-h-96 overflow-y-auto">
            {docComments.length === 0 ? (
              <p className="text-center text-primary-400 py-8">暂无评论</p>
            ) : (
              docComments.map((comment) => {
                const creator = getUserById(comment.createdBy);
                return (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-xl ${
                      comment.isResolved ? 'bg-success-50/50 opacity-70' : 'bg-primary-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar src={creator?.avatar} name={creator?.name} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-primary-800">{creator?.name}</span>
                            <span className="text-xs text-primary-400 ml-2">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          {!comment.isResolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resolveComment(comment.id)}
                              leftIcon={<Check className="w-4 h-4" />}
                            >
                              解决
                            </Button>
                          )}
                          {comment.isResolved && (
                            <Badge variant="success" size="sm">已解决</Badge>
                          )}
                        </div>
                        <p className="text-primary-700 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
