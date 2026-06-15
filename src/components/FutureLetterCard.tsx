import React, { useState } from 'react';
import { cn } from '@/utils/helpers';
import type { FutureLetter, MoodType } from '@/types';
import { MOOD_OPTIONS } from '@/types';
import { formatDateCN, daysUntil, formatDateTime } from '@/utils/date';
import { Avatar } from './Avatar';

interface FutureLetterCardProps {
  letter: FutureLetter;
  onUnlock?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
  canEdit?: boolean;
  className?: string;
}

const getMoodInfo = (mood: MoodType) => {
  return MOOD_OPTIONS.find((m) => m.value === mood) || MOOD_OPTIONS[0];
};

export const FutureLetterCard: React.FC<FutureLetterCardProps> = ({
  letter,
  onUnlock,
  onEdit,
  onDelete,
  isAdmin = false,
  canEdit = false,
  className = '',
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(letter.status === 'read');
  const moodInfo = getMoodInfo(letter.mood);
  const isSealed = letter.status === 'sealed';
  const isUnlocked = letter.status === 'unlocked' || letter.status === 'read';

  const handleClick = () => {
    if (isSealed) return;
    if (!isOpened) {
      setIsOpening(true);
      setTimeout(() => {
        setIsOpening(false);
        setIsOpened(true);
        onUnlock?.();
      }, 1500);
    }
  };

  if (isSealed) {
    return (
      <div
        className={cn(
          'bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 shadow-sm border border-amber-100',
          className
        )}
      >
        <div className="relative">
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg z-10">
            <span className="text-white text-lg">🔒</span>
          </div>

          <div className="pt-8 text-center">
            <div className="text-5xl mb-3 animate-float">✉️</div>
            <h4 className="text-lg font-semibold text-gray-800 mb-1">
              {letter.recipient === 'self' ? '给未来自己的信' : '来自未来的信'}
            </h4>
            <p className="text-sm text-gray-500 mb-3">
              {letter.isAnonymous ? '一位神秘的朋友' : letter.authorName}
            </p>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 rounded-full text-amber-700 text-sm">
              <span>🕐</span>
              <span>将在 {formatDateCN(letter.deliveryDate)} 送达</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              还有 {daysUntil(letter.deliveryDate)} 天
            </p>

            {!letter.isAnonymous && (
              <div className="mt-4 flex justify-center">
                <Avatar name={letter.authorName} size="sm" />
              </div>
            )}

            {(canEdit || isAdmin) && (
              <div className="mt-4 flex justify-center gap-2">
                {canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.();
                    }}
                    className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
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
                    className="px-3 py-1 text-sm bg-white border border-red-200 rounded-lg text-red-500 hover:bg-red-50"
                  >
                    删除
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="absolute top-2 right-2">
            <span className="text-2xl">{moodInfo.emoji}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300',
        isOpening && 'scale-105',
        className
      )}
      onClick={handleClick}
    >
      {!isOpened ? (
        <div className="p-6 text-center">
          <div className="relative inline-block">
            <div className={cn(
              'text-6xl transition-all duration-500',
              isOpening ? 'animate-bounce-in' : 'animate-float'
            )}>
              {isOpening ? '📨' : '✉️'}
            </div>
            {!isOpening && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs animate-pulse">
                新
              </div>
            )}
          </div>
          <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
            {letter.recipient === 'self' ? '给自己的信' : '来自未来的信'}
          </h4>
          <p className="text-sm text-gray-500">
            {letter.isAnonymous ? '一位神秘的朋友' : letter.authorName} · {formatDateCN(letter.deliveryDate)}
          </p>
          <p className="text-xs text-orange-500 mt-3">点击打开信件 ✨</p>
        </div>
      ) : (
        <>
          <div className="p-5 border-b border-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {letter.isAnonymous ? (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-500">?</span>
                  </div>
                ) : (
                  <Avatar name={letter.authorName} size="md" />
                )}
                <div>
                  <p className="font-medium text-gray-800">
                    {letter.isAnonymous ? '匿名' : letter.authorName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDateTime(letter.createdAt)} 寄出 · {formatDateCN(letter.deliveryDate)} 送达
                  </p>
                </div>
              </div>
              <span
                className="px-2 py-1 rounded-full text-xs text-white"
                style={{ backgroundColor: moodInfo.color }}
              >
                {moodInfo.emoji} {moodInfo.label}
              </span>
            </div>

            {letter.recipient === 'self' && (
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-full text-purple-600 text-xs">
                <span>🔒</span>
                <span>仅自己可见</span>
              </div>
            )}
          </div>

          <div className="p-5">
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gradient-to-br from-orange-50/50 to-amber-50/50 p-4 rounded-xl border border-orange-100">
              <span className="text-2xl mr-2">💌</span>
              {letter.content}
            </div>

            {letter.photo && (
              <div className="mt-4 rounded-xl overflow-hidden">
                <img
                  src={letter.photo}
                  alt="信件照片"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <span className="text-orange-400">📅</span>
              <span>这封信穿越了 {Math.abs(new Date(letter.deliveryDate).getTime() - new Date(letter.createdAt).getTime()) / (1000 * 60 * 60 * 24) | 0} 天的时光</span>
            </div>
          </div>

          {(canEdit || isAdmin) && (
            <div className="px-5 pb-4 flex gap-2">
              {canEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.();
                  }}
                  className="flex-1 py-2 text-sm bg-gray-50 rounded-xl text-gray-600 hover:bg-gray-100"
                >
                  修改内容
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}
                  className="flex-1 py-2 text-sm bg-red-50 rounded-xl text-red-500 hover:bg-red-100"
                >
                  删除
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
