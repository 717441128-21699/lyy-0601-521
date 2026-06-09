import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  FileText,
  PenTool,
  CheckSquare,
  Calendar,
} from 'lucide-react';
import { useMessageStore } from '../../store/useMessageStore';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const { getUnreadCount } = useMessageStore();
  const navigate = useNavigate();

  const unreadCount = getUnreadCount();

  const createOptions = [
    { icon: FileText, label: '新建文档', action: () => navigate('/documents') },
    { icon: PenTool, label: '新建白板', action: () => navigate('/whiteboard') },
    { icon: CheckSquare, label: '新建任务', action: () => navigate('/tasks') },
    { icon: Calendar, label: '新建日程', action: () => navigate('/schedule') },
  ];

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-primary-100 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-xl">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
            searchFocused ? 'text-accent-500' : 'text-primary-400'
          }`} />
          <input
            type="text"
            placeholder="搜索文档、任务、成员..."
            className="w-full pl-10 pr-4 py-2 bg-primary-50/50 border border-transparent rounded-lg text-sm placeholder:text-primary-400 focus:outline-none focus:bg-white focus:border-accent-300 focus:ring-2 focus:ring-accent-500/20 transition-all"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateMenu(!showCreateMenu)}
          >
            新建
            <ChevronDown className="w-4 h-4" />
          </Button>

          {showCreateMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-float border border-primary-100 py-2 z-50 animate-scale-in">
              {createOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    option.action();
                    setShowCreateMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  <option.icon className="w-4 h-4 text-primary-400" />
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/messages')}
          className="relative p-2.5 rounded-lg text-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-accent-500 text-white text-xs font-medium rounded-full flex items-center justify-center animate-bounce-soft">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
