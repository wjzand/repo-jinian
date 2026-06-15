import React, { useState } from 'react';
import type { FutureLetter } from '@/types';
import { getMoodInfo, getLetterPresetInfo, getLetterStatusInfo } from '@/types';
import { formatDateCN, daysUntil } from '@/utils/date';
import { Avatar } from '@/components/Avatar';
import { cn } from '@/utils/helpers';

interface LetterCardProps {
  letter: FutureLetter;
  isAdmin?: boolean;
  isAuthor?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const LetterCard: React.FC<LetterCardProps> = ({
  letter,
  isAdmin = false,
  isAuthor = false,
  onClick,
  onEdit,
  onDelete,
  className = '',
  style,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const moodInfo = getMoodInfo(letter.mood);
  const presetInfo = getLetterPresetInfo(letter.preset);
  const statusInfo = getLetterStatusInfo(letter.status);
  
  const isSealed = letter.status === 'sealed';
  const isUnlocked = letter.status === 'unlocked' || letter.status === 'read';
  
  const daysLeft = daysUntil(letter.deliveryDate);
  const canEdit = isAuthor && isSealed;

  if (isSealed) {
    return (
      <div
        className={cn(
          'relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300',
          'border-2 border-amber-200 shadow-lg hover:shadow-xl hover:scale-[1.02]',
          'animate-fade-in',
          className
        )}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        <div className="p-5">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✉️</span>
                <span className="text-sm font-medium text-amber-700">时间信封</span>
              </div>
              <span 
                className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700"
              >
                {statusInfo.icon} {statusInfo.label}
              </span>
            </div>

            <div className="relative bg-white/60 rounded-xl p-4 mb-4">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div 
                  className={cn(
                    'w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500',
                    'flex items-center justify-center shadow-lg',
                    'transition-transform duration-500',
                    isHovered && 'animate-bounce'
                  )}
                  style={{
                    boxShadow: '0 4px 20px rgba(251, 146, 60, 0.4)'
                  }}
                >
                  <span className="text-3xl">🔒</span>
                </div>
              </div>
              <div className="h-20" />
            </div>

            <div className="text-center space-y-2">
              <p className="text-lg font-bold text-gray-800">
                {letter.isAnonymous ? '匿名同事' : letter.authorName}
              </p>
              <p className="text-sm text-gray-500">写给{letter.recipient === 'self' ? '未来的自己' : 'TA'}</p>
            </div>

            <div className="mt-4 p-3 bg-white/50 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span>{presetInfo.emoji}</span>
                <span className="text-gray-600">{presetInfo.label}</span>
              </div>
              <p className="text-center mt-1">
                <span className="text-amber-600 font-medium">
                {daysLeft > 0 
                  ? `还有 ${daysLeft} 天后送达`
                  : '今天送达'
                }
                </span>
              </p>
              <p className="text-center text-xs text-gray-400 mt-1">
                {formatDateCN(letter.deliveryDate)}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-center">
              <span 
                className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: `${moodInfo.color}20`, color: moodInfo.color }}
              >
                {moodInfo.emoji} {moodInfo.label}
              </span>
            </div>

            {(canEdit || isAdmin) && (
              <div className="mt-4 flex gap-2">
                {canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.();
                    }}
                    className="flex-1 py-2 text-sm text-amber-600 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    修改
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.();
                    }}
                    className="flex-1 py-2 text-sm text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    删除
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300',
        'border border-gray-100 shadow-md hover:shadow-lg hover:scale-[1.01]',
        'animate-fade-in',
        className
      )}
      style={style}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar name={letter.isAnonymous ? '匿' : letter.authorName} />
            <div>
              <p className="font-medium text-gray-800">
                {letter.isAnonymous ? '匿名同事' : letter.authorName}
              </p>
              <p className="text-xs text-gray-400">
                来自未来的信 · {formatDateCN(letter.deliveryDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span 
              className="text-xs px-2 py-1 rounded-full text-green-600 bg-green-50"
            >
              {statusInfo.icon} {statusInfo.label}
            </span>
          </div>
        </div>

        {letter.photo && (
          <div className="mt-3 rounded-xl overflow-hidden">
            <img 
              src={letter.photo} 
              alt="信件照片" 
              className="w-full h-40 object-cover"
            />
          </div>
        )}

        <div className="mt-3">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {letter.content}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span 
            className="text-xs px-2 py-1 rounded-full"
            style={{ backgroundColor: `${moodInfo.color}20`, color: moodInfo.color }}
          >
            {moodInfo.emoji} {moodInfo.label}
          </span>
          <span className="text-xs text-gray-400">
            {presetInfo.emoji} {presetInfo.label}
          </span>
        </div>

        {letter.status === 'unlocked' && (
          <div className="mt-3 p-2 bg-emerald-50 rounded-lg text-center">
          <p className="text-xs text-emerald-600">
            ✨ 点击查看完整信件内容
          </p>
          </div>
        )}
      </div>
    </div>
  );
};
