import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Users, MessageCircle, Calendar, ChevronRight, Mail } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { useBookStore } from '@/store/useBookStore';
import { daysBetween, formatDateCN, daysUntil, isToday } from '@/utils/date';
import { useNavigate } from 'react-router-dom';

const themeGradients: Record<string, string> = {
  warm: 'from-orange-400 via-rose-400 to-pink-400',
  fresh: 'from-emerald-400 via-teal-400 to-cyan-400',
  simple: 'from-gray-300 via-gray-400 to-gray-500',
};

export const HomePage: React.FC = () => {
  const { currentBook, messages, moments, letters, isAdmin, userInfo } = useBookStore();
  const navigate = useNavigate();
  const [animateNumbers, setAnimateNumbers] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateNumbers(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!currentBook) {
    return null;
  }

  const workDays = daysBetween(currentBook.joinDate, currentBook.leaveDate);
  const leaveDaysLeft = daysUntil(currentBook.leaveDate);
  const isLeaveToday = isToday(currentBook.leaveDate);
  const isPastLeave = leaveDaysLeft < 0;

  const approvedMessages = messages.filter((m) => m.isApproved);
  const uniqueSenders = new Set(
    approvedMessages.map((m) => (m.isAnonymous ? 'anonymous' : m.authorName))
  ).size;

  const coverPhotos = moments
    .flatMap((m) => m.photos)
    .filter((p) => p);

  const unlockedLetterCount = useMemo(
    () => letters.filter((l) => l.status === 'unlocked').length,
    [letters]
  );

  const pendingLetterCount = useMemo(
    () => letters.filter((l) => l.status === 'sealed').length,
    [letters]
  );

  const gradientClass = themeGradients[currentBook.theme] || themeGradients.warm;

  return (
    <div className="min-h-screen pb-20">
      <div className={`bg-gradient-to-br ${gradientClass} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 -right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>

        <div className="safe-area-top px-6 pt-6 pb-8 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-white/90 text-sm font-medium">共事时光</h1>
            <button
              onClick={() => navigate('/manage')}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full p-1 bg-white/30 backdrop-blur-sm animate-float">
                <Avatar
                  src={currentBook.avatar}
                  name={currentBook.name}
                  size="xl"
                />
              </div>
              {isAdmin && (
                <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-white rounded-full text-xs font-medium text-orange-500 shadow-md">
                  管理员
                </div>
              )}
            </div>

            <h2 className="text-3xl font-bold text-white mb-1">
              {currentBook.name}
            </h2>
            {currentBook.nickname && (
              <p className="text-white/80 text-sm mb-3">
                昵称：{currentBook.nickname}
              </p>
            )}

            <p className="text-white/90 text-sm max-w-xs mb-4 leading-relaxed">
              {currentBook.bio}
            </p>

            <div className="flex items-center gap-4 text-white/80 text-sm mb-6">
              <span>{formatDateCN(currentBook.joinDate)}</span>
              <span className="text-white/50">→</span>
              <span>{formatDateCN(currentBook.leaveDate)}</span>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
              <div className="text-white/80 text-xs mb-1">
                {isPastLeave ? '共共事' : '还有'}
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span
                  className={`text-4xl font-bold text-white transition-all duration-1000 ${
                    animateNumbers ? 'opacity-100' : 'opacity-0 scale-90'
                  }`}
                >
                  {Math.abs(leaveDaysLeft)}
                </span>
                <span className="text-white text-lg">天</span>
              </div>
              <div className="text-white/80 text-xs mt-1">
                {isPastLeave
                  ? '的美好时光'
                  : isLeaveToday
                  ? '，今天是个特别的日子'
                  : '就要说再见了'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-20">
        <div className="bg-white rounded-2xl shadow-soft p-5">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="w-9 h-9 mx-auto mb-2 bg-orange-50 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-xl font-bold text-gray-800">
                {approvedMessages.length}
              </div>
              <div className="text-xs text-gray-500">条祝福</div>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 mx-auto mb-2 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold text-gray-800">
                {uniqueSenders}
              </div>
              <div className="text-xs text-gray-500">位同事</div>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 mx-auto mb-2 bg-sky-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-xl font-bold text-gray-800">
                {moments.length}
              </div>
              <div className="text-xs text-gray-500">个时刻</div>
            </div>
            <button
              onClick={() => navigate('/mailbox')}
              className="text-center hover:bg-gray-50 rounded-xl transition-colors -m-1 p-1"
            >
              <div className="w-9 h-9 mx-auto mb-2 bg-amber-50 rounded-xl flex items-center justify-center relative">
                <Mail className="w-4 h-4 text-amber-500" />
                {unlockedLetterCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {unlockedLetterCount}
                  </div>
                )}
              </div>
              <div className="text-xl font-bold text-gray-800">
                {letters.length}
              </div>
              <div className="text-xs text-gray-500">封信件</div>
            </button>
          </div>

          {pendingLetterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  <span className="text-amber-500">🕐</span> 还有 {pendingLetterCount} 封未来信件在路上
                </span>
                <button
                  onClick={() => navigate('/mailbox')}
                  className="text-amber-500 font-medium flex items-center gap-1"
                >
                  查看
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {unlockedLetterCount > 0 && (
        <div className="px-4 mt-4">
          <button
            onClick={() => navigate('/mailbox')}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-amber-200/40 animate-pulse-glow"
          >
            <div className="w-11 h-11 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-bold">
                🎉 你有 {unlockedLetterCount} 封未来信件已送达！
              </p>
              <p className="text-white/80 text-xs mt-0.5">
                点击查看来自未来的惊喜
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/80 flex-shrink-0" />
          </button>
        </div>
      )}

      {coverPhotos.length > 0 && (
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">团队合影</h3>
            <span className="text-xs text-gray-400">
              {coverPhotos.length}张照片
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {coverPhotos.slice(0, 5).map((photo, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-32 h-40 rounded-2xl overflow-hidden shadow-card"
              >
                <img
                  src={photo}
                  alt={`合影${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {approvedMessages.length > 0 && (
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">最新祝福</h3>
            <button
              onClick={() => navigate('/messages')}
              className="text-sm text-orange-500 flex items-center gap-1"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {approvedMessages.slice(0, 2).map((message) => (
              <div
                key={message.id}
                className="bg-white rounded-xl p-3 shadow-card flex items-start gap-3"
              >
                <Avatar
                  name={message.isAnonymous ? '匿名' : message.authorName}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-800">
                      {message.isAnonymous ? '匿名同事' : message.authorName}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {moments.length > 0 && (
        <div className="px-4 mt-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">共事时光</h3>
            <button
              onClick={() => navigate('/timeline')}
              className="text-sm text-orange-500 flex items-center gap-1"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-rose-50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-sm text-gray-600">
                {formatDateCN(moments[0]?.date || '')}
              </span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">
              {moments[0]?.title}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {moments[0]?.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
