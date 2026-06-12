import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { MessagesPage } from '@/pages/MessagesPage';
import { TimelinePage } from '@/pages/TimelinePage';
import { FarewellPage } from '@/pages/FarewellPage';
import { ManagePage } from '@/pages/ManagePage';
import { CreateBookPage } from '@/pages/CreateBookPage';
import { BottomNav } from '@/components/BottomNav';
import { useBookStore } from '@/store/useBookStore';
import type { TabType } from '@/types';
import { getUserInfo } from '@/utils/storage';

const tabRoutes: Record<TabType, string> = {
  home: '/',
  messages: '/messages',
  timeline: '/timeline',
  farewell: '/farewell',
};

function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentBook, loadBookList, loadBook, initWithSampleData, loading } = useBookStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      loadBookList();

      const userInfo = getUserInfo();
      const lastBookId = userInfo?.lastBookId;

      if (lastBookId) {
        loadBook(lastBookId);
      }

      setTimeout(() => {
        setIsInitialized(true);
      }, 100);
    };

    init();
  }, []);

  useEffect(() => {
    if (isInitialized && !currentBook && location.pathname === '/') {
      initWithSampleData();
    }
  }, [isInitialized, currentBook, location.pathname, initWithSampleData]);

  const getActiveTab = (): TabType => {
    const path = location.pathname;
    if (path === '/messages') return 'messages';
    if (path === '/timeline') return 'timeline';
    if (path === '/farewell') return 'farewell';
    return 'home';
  };

  const handleTabChange = (tab: TabType) => {
    navigate(tabRoutes[tab]);
  };

  const showBottomNav = ['/', '/messages', '/timeline', '/farewell'].includes(location.pathname);

  if (!isInitialized || (loading && !currentBook)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center animate-pulse">
            <span className="text-2xl">🌸</span>
          </div>
          <p className="text-gray-500 text-sm">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/farewell" element={<FarewellPage />} />
        <Route path="/manage" element={<ManagePage />} />
        <Route path="/create" element={<CreateBookPage />} />
      </Routes>

      {showBottomNav && <BottomNav activeTab={getActiveTab()} onTabChange={handleTabChange} />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}
