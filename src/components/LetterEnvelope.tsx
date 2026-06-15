import React, { useState } from 'react';
import { Lock, Mail, Heart, Sparkles } from 'lucide-react';
import type { FutureLetter, MoodType } from '@/types';
import { MOOD_OPTIONS } from '@/types';
import { formatDateCN, daysUntil } from '@/utils/date';
import { Avatar } from '@/components/Avatar';
import { cn } from '@/utils/helpers';

interface LetterEnvelopeProps {
  letter: FutureLetter;
  isAdmin?: boolean;
  isAuthor?: boolean;
  onOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const LetterEnvelope: React.FC<LetterEnvelopeProps> = ({
  letter,
  isAdmin = false,
  isAuthor = false,
  onOpen,
  onEdit,
  onDelete,
  className = '',
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(letter.status === 'read');

  const moodInfo = MOOD_OPTIONS.find((m) => m.value === letter.mood) || MOOD_OPTIONS[0];
  const isSealed = letter.status === 'sealed';
  const daysToDelivery = daysUntil(letter.deliveryDate);

  const handleClick = () => {
    if (isSealed) return;
    if (!isOpened) {
      setIsOpening(true);
      setTimeout(() => {
        setIsOpening(false);
        setIsOpened(true);
        onOpen?.();
      }, 1500);
    } else {
      onOpen?.();
    }
  };

  if (isSealed) {
    return (
      <div
        className={cn(
          'relative bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 shadow-lg cursor-not-allowed select-none overflow-hidden',
          className
        )}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0iI2ZlZjNlMCIvPjxwYXRoIGQ9Ik0wIDMwIDMwIDAgMzAgNjAgMCAzMFoiIGZpbGw9IiNmZmU4ZDciLz48L3N2Zz4=')] opacity-50" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">时间信封</p>
                <p className="text-xs text-amber-700">已封存 · 不可查看</p>
              </div>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: moodInfo.color + '30' }}
            >
              {moodInfo.emoji}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-4 border border-amber-200">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-24 h-16 bg-gradient-to-br from-amber-200 to-orange-300 rounded-lg shadow-inner flex items-center justify-center">
                  <Mail className="w-8 h-8 text-amber-700" />
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg animate-pulse">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-700">送达时间：</span>
              <span className="font-semibold text-amber-900">{formatDateCN(letter.deliveryDate)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-700">还有：</span>
              <span className="font-bold text-orange-600">{daysToDelivery > 0 ? `${daysToDelivery}天` : '即将送达'}</span>
            </div>
            {!letter.isAnonymous && (
              <div className="flex items-center gap-2 pt-2 border-t border-amber-200">
                <Avatar name={letter.authorName} size="sm" />
                <span className="text-sm text-amber-800">来自 {letter.authorName}</span>
              </div>
            )}
            {letter.isAnonymous && (
              <div className="flex items-center gap-2 pt-2 border-t border-amber-200">
                <Avatar name="?" size="sm" />
                <span className="text-sm text-amber-800">来自匿名同事</span>
              </div>
            )}
          </div>

          {(isAdmin || isAuthor) && (
            <div className="flex gap-2 mt-4 pt-3 border-t border-amber-200">
              {isAuthor && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.();
                  }}
                  className="flex-1 py-2 px-3 bg-white/80 text-amber-800 text-sm rounded-lg hover:bg-white transition"
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
                  className="flex-1 py-2 px-3 bg-rose-100 text-rose-600 text-sm rounded-lg hover:bg-rose-200 transition"
                >
                  删除
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl',
        isOpening && 'scale-105',
        className
      )}
      onClick={handleClick}
    >
      {isOpening && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 z-20 flex items-center justify-center animate-fade-in">
          <div className="text-center">
            <div className="text-4xl mb-3 animate-bounce-in">💌</div>
            <p className="text-amber-800 font-semibold">信件开启中...</p>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-orange-50 to-rose-50 px-4 py-3 border-b border-orange-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">来自未来的信</p>
              <p className="text-xs text-gray-500">
                {letter.recipient === 'self' ? '写给未来的自己' : '写给TA'}
              </p>
            </div>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: moodInfo.color + '20' }}
          >
            {moodInfo.emoji}
          </div>
        </div>
      </div>

      <div className="p-4">
        {isOpened ? (
          <>
            <div className="mb-3 pb-3 border-b border-gray-100">
              {!letter.isAnonymous ? (
                <div className="flex items-center gap-2">
                  <Avatar name={letter.authorName} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{letter.authorName}</p>
                    <p className="text-xs text-gray-500">{formatDateCN(letter.deliveryDate)} 送达</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Avatar name="?" size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">匿名同事</p>
                    <p className="text-xs text-gray-500">{formatDateCN(letter.deliveryDate)} 送达</p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {letter.content}
            </p>

            {letter.photo && (
              <div className="mt-3 rounded-xl overflow-hidden">
                <img
                  src={letter.photo}
                  alt="信件照片"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <div className="text-5xl mb-3 animate-pulse">✨</div>
            <p className="text-gray-600 font-medium">点击开启这封来自未来的信</p>
            <p className="text-xs text-gray-400 mt-1">送达时间：{formatDateCN(letter.deliveryDate)}</p>
          </div>
        )}
      </div>

      {isOpened && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Heart className="w-3 h-3" />
            <span>来自 {letter.isAnonymous ? '匿名同事' : letter.authorName} 的心意</span>
          </div>
        </div>
      )}
    </div>
  );
};
