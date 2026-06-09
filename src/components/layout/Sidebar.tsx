import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PenTool,
  CheckSquare,
  Calendar,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Star,
  Plus,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '工作台' },
  { path: '/documents', icon: FileText, label: '文档' },
  { path: '/whiteboard', icon: PenTool, label: '白板' },
  { path: '/tasks', icon: CheckSquare, label: '任务' },
  { path: '/schedule', icon: Calendar, label: '日程' },
  { path: '/messages', icon: MessageSquare, label: '消息' },
  { path: '/management', icon: Settings, label: '管理' },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { spaces, toggleFavorite } = useDocumentStore();
  const { currentUser } = useAuthStore();

  const favoriteSpaces = spaces.filter(s => s.isFavorite);

  return (
    <aside
      className={cn(
        'h-full bg-white border-r border-primary-100 flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-primary-100">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">协</span>
            </div>
            <span className="font-display font-bold text-lg text-primary-800">协作空间</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-400 hover:text-primary-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4">
        <div className="px-3 mb-6">
          {!collapsed && (
            <p className="px-3 text-xs font-medium text-primary-400 uppercase tracking-wider mb-2">
              导航
            </p>
          )}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-accent-50 text-accent-600 font-medium'
                      : 'text-primary-600 hover:bg-primary-50 hover:text-primary-800'
                  )}
                >
                  <Icon className={cn(
                    'w-5 h-5 flex-shrink-0 transition-transform',
                    isActive ? 'text-accent-500' : 'text-primary-400 group-hover:text-primary-600'
                  )} />
                  {!collapsed && <span className="animate-fade-in">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </div>

        {!collapsed && favoriteSpaces.length > 0 && (
          <div className="px-3 mb-6">
            <p className="px-3 text-xs font-medium text-primary-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-warning-500 fill-warning-500" />
              收藏空间
            </p>
            <div className="space-y-1">
              {favoriteSpaces.map((space) => (
                <div
                  key={space.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-primary-600 hover:bg-primary-50 cursor-pointer group transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: space.color }}
                  />
                  <span className="text-sm truncate flex-1">{space.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(space.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white rounded"
                  >
                    <Star className="w-3.5 h-3.5 text-warning-500 fill-warning-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!collapsed && (
          <div className="px-3">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-primary-200 text-primary-400 hover:border-accent-400 hover:text-accent-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">新建空间</span>
            </button>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-primary-100">
        {currentUser && (
          <div className={cn(
            'flex items-center gap-3',
            collapsed ? 'justify-center' : ''
          )}>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-800 truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-primary-400 truncate">
                  {currentUser.role === 'admin' ? '管理员' : currentUser.role === 'member' ? '成员' : '访客'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
