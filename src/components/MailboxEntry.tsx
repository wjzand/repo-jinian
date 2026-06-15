import React from 'react';
import { Mailbox, Sparkles, Clock, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBookStore } from '@/store/useBookStore';
import { cn } from '@/utils/helpers';

interface MailboxEntryProps {
  className?: string;
}

export const MailboxEntry: React.FC<MailboxEntryProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { letters, isAdmin, currentBook, userInfo } = useBookStore();

  const sealedLetters = letters.filter((l) => l.status === 'sealed');
  const unlockedLetters = letters.filter((l) => l.status === 'unlocked' || l.status === 'read');
  const newLetters = letters.filter((l) => l.status === 'unlocked').length;

  const isSelf = currentBook && userInfo?.name === currentBook.name;

  return (
    <div
      className={cn(
        'relative bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-2xl p-5 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]',
        className
      )}
      onClick={() => navigate('/mailbox')}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSIyIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')]" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Mailbox className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">未来信箱</h3>
              <p className="text-white/80 text-xs">穿越时间的温暖问候</p>
            </div>
          </div>
          {newLetters > 0 && (
            <div className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
              {newLetters}封新信
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 text-center">
            <div className="text-white font-bold text-xl">{unlockedLetters.length}</div>
            <div className="text-white/70 text-xs">已送达</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 text-center">
            <div className="text-white font-bold text-xl">{sealedLetters.length}</div>
            <div className="text-white/70 text-xs">待送达</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5 text-center">
            <div className="text-white font-bold text-xl">{letters.length}</div>
            <div className="text-white/70 text-xs">总信件</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/mailbox/write');
            }}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white text-orange-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-orange-50 transition text-sm"
          >
            <Send className="w-4 h-4" />
            <span>写一封未来信</span>
          </button>
          {isSelf && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/mailbox/write?self=true');
              }}
              className="flex items-center justify-center gap-1.5 bg-white/20 backdrop-blur-sm text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-white/30 transition text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>给自己</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
