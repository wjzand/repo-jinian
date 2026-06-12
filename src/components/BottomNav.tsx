import React from 'react';
import { Home, MessageCircleHeart, Clock, ScrollText } from 'lucide-react';
import type { TabType } from '@/types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
  { key: 'home', label: '首页', icon: <Home className="w-5 h-5" /> },
  { key: 'messages', label: '留言墙', icon: <MessageCircleHeart className="w-5 h-5" /> },
  { key: 'timeline', label: '时光轴', icon: <Clock className="w-5 h-5" /> },
  { key: 'farewell', label: '告别信', icon: <ScrollText className="w-5 h-5" /> },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              activeTab === tab.key
                ? 'text-orange-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className={`transition-transform ${activeTab === tab.key ? 'scale-110' : ''}`}>
              {tab.icon}
            </span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
