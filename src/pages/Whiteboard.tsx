import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
  StickyNote,
  Square,
  Circle,
  Type,
  Hand,
  MoreHorizontal,
  ChevronDown,
  Users,
  Download,
} from 'lucide-react';
import { useScheduleStore } from '../store/useScheduleStore';
import { useAuthStore } from '../store/useAuthStore';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import type { StickyNote as StickyNoteType } from '../types';

const noteColors = [
  '#FFE082',
  '#A5D6A7',
  '#90CAF9',
  '#F48FB1',
  '#CE93D8',
  '#FFAB91',
  '#BCAAA4',
  '#B3E5FC',
];

const tools = [
  { id: 'select', icon: Hand, label: '选择' },
  { id: 'sticky', icon: StickyNote, label: '便签' },
  { id: 'rect', icon: Square, label: '矩形' },
  { id: 'circle', icon: Circle, label: '圆形' },
  { id: 'text', icon: Type, label: '文字' },
];

export const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    whiteboards,
    stickyNotes,
    activeBoardId,
    setActiveBoard,
    addStickyNote,
    updateStickyNote,
    deleteStickyNote,
    createWhiteboard,
  } = useScheduleStore();
  const { users, getUserById, currentUser } = useAuthStore();

  const [activeTool, setActiveTool] = useState('select');
  const [selectedColor, setSelectedColor] = useState(noteColors[0]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNote, setDraggingNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  const activeBoard = whiteboards.find(w => w.id === activeBoardId);
  const boardNotes = stickyNotes.filter(sn => sn.boardId === activeBoardId);

  const onlineUsers = users.slice(0, 3);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'select' && e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
    if (activeTool === 'sticky') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;
        addStickyNote({
          content: '',
          color: selectedColor,
          x,
          y,
          boardId: activeBoardId || undefined,
        });
        setActiveTool('select');
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
    if (draggingNote) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
        const y = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;
        updateStickyNote(draggingNote, { x, y });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingNote(null);
  };

  const handleNoteMouseDown = (e: React.MouseEvent, note: StickyNoteType) => {
    e.stopPropagation();
    if (activeTool === 'select') {
      setDraggingNote(note.id);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        setDragOffset({
          x: (e.clientX - rect.left) / zoom,
          y: (e.clientY - rect.top) / zoom,
        });
      }
    }
  };

  const handleNoteDoubleClick = (noteId: string) => {
    setEditingNote(noteId);
  };

  const handleNoteContentChange = (noteId: string, content: string) => {
    updateStickyNote(noteId, { content });
  };

  const handleNoteBlur = () => {
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteStickyNote(noteId);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      createWhiteboard({ name: newBoardName.trim() });
      setNewBoardName('');
      setShowNewBoardModal(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col h-full bg-primary-50/30"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between px-4 py-3 bg-white border-b border-primary-100">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Button
              variant="outline"
              rightIcon={<ChevronDown className="w-4 h-4" />}
              onClick={() => setShowBoardMenu(!showBoardMenu)}
            >
              {activeBoard?.name || '选择白板'}
            </Button>
            <AnimatePresence>
              {showBoardMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-float border border-primary-100 py-2 z-50"
                >
                  {whiteboards.map(board => (
                    <button
                      key={board.id}
                      onClick={() => {
                        setActiveBoard(board.id);
                        setShowBoardMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-primary-50 transition-colors flex items-center justify-between ${
                        board.id === activeBoardId ? 'bg-accent-50 text-accent-700' : 'text-primary-700'
                      }`}
                    >
                      <span className="font-medium">{board.name}</span>
                      {board.id === activeBoardId && (
                        <Badge variant="accent" size="sm">当前</Badge>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-primary-100 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setShowBoardMenu(false);
                        setShowNewBoardModal(true);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-primary-50 text-accent-600 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      新建白板
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Badge variant="outline" size="sm">
            {boardNotes.length} 个便签
          </Badge>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            {onlineUsers.map(user => (
              <div key={user.id} className="relative">
                <Avatar src={user.avatar} name={user.name} size="sm" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success-500 border-2 border-white rounded-full" />
              </div>
            ))}
            <Badge variant="success" size="sm" className="ml-2">
              <Users className="w-3 h-3 mr-1" />
              {onlineUsers.length} 人在线
            </Badge>
          </div>

          <div className="flex items-center gap-1 bg-primary-50 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-white rounded-md transition-colors"
            >
              <ZoomOut className="w-4 h-4 text-primary-600" />
            </button>
            <span className="px-3 text-sm text-primary-600 font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-white rounded-md transition-colors"
            >
              <ZoomIn className="w-4 h-4 text-primary-600" />
            </button>
            <button
              onClick={handleResetView}
              className="p-2 hover:bg-white rounded-md transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-primary-600" />
            </button>
          </div>

          <Button variant="outline" rightIcon={<Download className="w-4 h-4" />}>
            导出
          </Button>
        </div>
      </motion.div>

      <div className="flex-1 flex overflow-hidden">
        <motion.div variants={itemVariants} className="w-16 bg-white border-r border-primary-100 flex flex-col items-center py-4 gap-2">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                activeTool === tool.id
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'hover:bg-primary-50 text-primary-600'
              }`}
              title={tool.label}
            >
              <tool.icon className="w-5 h-5" />
            </button>
          ))}

          <div className="w-8 h-px bg-primary-100 my-2" />

          <div className="grid grid-cols-2 gap-1.5">
            {noteColors.map((color, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedColor(color);
                  setActiveTool('sticky');
                }}
                className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${
                  selectedColor === color && activeTool === 'sticky' ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          ref={canvasRef}
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
          style={{ cursor: activeTool === 'sticky' ? 'crosshair' : undefined }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle, #CBD5E1 1px, transparent 1px)
              `,
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`,
            }}
          />

          <div
            className="absolute"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            <AnimatePresence>
              {boardNotes.map(note => {
                const creator = getUserById(note.createdBy);
                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute"
                    style={{
                      left: note.x,
                      top: note.y,
                      width: note.width,
                      minHeight: note.height,
                      backgroundColor: note.color,
                    }}
                    onMouseDown={(e) => handleNoteMouseDown(e, note)}
                    onDoubleClick={() => handleNoteDoubleClick(note.id)}
                  >
                    <div
                      className="w-full h-full rounded-lg shadow-lg p-3 cursor-move relative group"
                      style={{ backgroundColor: note.color }}
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="p-1 hover:bg-black/10 rounded"
                        >
                          <Trash2 className="w-3 h-3 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-black/10 rounded">
                          <MoreHorizontal className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>

                      {editingNote === note.id ? (
                        <textarea
                          autoFocus
                          value={note.content}
                          onChange={(e) => handleNoteContentChange(note.id, e.target.value)}
                          onBlur={handleNoteBlur}
                          className="w-full h-full bg-transparent resize-none outline-none text-sm text-gray-800"
                          style={{ minHeight: note.height - 24 }}
                          placeholder="输入内容..."
                        />
                      ) : (
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {note.content || '双击编辑...'}
                        </p>
                      )}

                      <div className="absolute bottom-2 left-3 flex items-center gap-2">
                        <Avatar src={creator?.avatar} name={creator?.name} size="xs" />
                        <span className="text-xs text-gray-500">{creator?.name}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {activeTool === 'sticky' && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg text-sm text-primary-600">
              点击画布创建便签
            </div>
          )}
        </motion.div>
      </div>

      <Modal
        isOpen={showNewBoardModal}
        onClose={() => setShowNewBoardModal(false)}
        title="新建白板"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowNewBoardModal(false)}>
              取消
            </Button>
            <Button onClick={handleCreateBoard}>
              创建
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-2">
              白板名称
            </label>
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="输入白板名称..."
              className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 outline-none transition-all"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
            />
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
