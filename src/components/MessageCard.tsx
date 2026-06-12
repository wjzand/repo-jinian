import React, { useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { Avatar } from './Avatar';
import type { Message } from '@/types';
import { MOOD_OPTIONS, CARD_COLORS } from '@/types';
import { getRelativeTime } from '@/utils/date';
import { cn } from '@/lib/utils';

interface MessageCardProps {
  message: Message;
  onLike?: () => void;
  hasLiked?: boolean;
  isAdmin?: boolean;
  onThank?: () => void;
  onDelete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function getCardColor(index: number): string {
  return CARD_COLORS[index % CARD_COLORS.length];
}

function getMoodInfo(mood: string) {
  return MOOD_OPTIONS.find((m) => m.value === mood) || MOOD_OPTIONS[0];
}

export const MessageCard: React.FC<MessageCardProps> = ({
  message,
  onLike,
  hasLiked = false,
  isAdmin = false,
  onThank,
  onDelete,
  className = '',
  style,
}) => {
  const [showHearts, setShowHearts] = useState(false);
  const colorIndex = Math.floor(Math.random() * CARD_COLORS.length);
  const moodInfo = getMoodInfo(message.mood);

  const handleLike = () => {
    if (!hasLiked) {
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 800);
    }
    onLike?.();
  };

  const displayName = message.isAnonymous ? '匿名同事' : message.authorName;

  return (
    <div
      className={cn(
        'relative rounded-2xl p-4 shadow-card animate-slide-up',
        getCardColor(colorIndex),
        className
      )}
      style={style}
    >
      {showHearts && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="absolute text-pink-500 animate-bounce-in"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${30 + Math.random() * 40}%`,
                animationDelay: `${i * 0.1}s`,
                fontSize: `${16 + Math.random() * 12}px`,
              }}
            >
              ❤️
            </span>
          ))}
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        <Avatar name={displayName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 text-sm truncate">
              {displayName}
            </span>
            <span
              className="flex-shrink-0 px-2 py-0.5 text-xs rounded-full"
              style={{ backgroundColor: moodInfo.color + '20', color: moodInfo.color }}
            >
              {moodInfo.emoji} {moodInfo.label}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {getRelativeTime(message.createdAt)}
          </span>
        </div>
      </div>

      <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
        {message.content}
      </p>

      {message.photo && (
        <div className="mb-3 rounded-xl overflow-hidden">
          <img
            src={message.photo}
            alt="留言照片"
            className="w-full h-auto"
          />
        </div>
      )}

      {message.thankYou && (
        <div className="mb-3 p-3 bg-white/60 rounded-xl">
          <div className="flex items-center gap-1 text-xs text-orange-500 mb-1">
            <Sparkles className="w-3 h-3" />
            <span>TA回复了</span>
          </div>
          <p className="text-sm text-gray-700">{message.thankYou}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={handleLike}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all',
            hasLiked
              ? 'bg-pink-100 text-pink-500'
              : 'bg-white/60 text-gray-500 hover:bg-pink-50 hover:text-pink-400'
          )}
        >
          <Heart className={cn('w-4 h-4', hasLiked && 'fill-current')} />
          <span>{message.likes}</span>
        </button>

        {isAdmin && (
          <div className="flex gap-2">
            {!message.thankYou && (
              <button
                onClick={onThank}
                className="px-3 py-1.5 text-xs bg-orange-100 text-orange-500 rounded-full hover:bg-orange-200 transition-colors"
              >
                回复
              </button>
            )}
            <button
              onClick={onDelete}
              className="px-3 py-1.5 text-xs bg-gray-100 text-gray-500 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
            >
              删除
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
