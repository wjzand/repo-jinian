import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import type { FutureLetter, MoodType } from '@/types';
import { MOOD_OPTIONS, LETTER_TIME_PRESETS } from '@/types';
import { formatDate, daysUntil } from '@/utils/date';

interface EnvelopeProps {
  letter: FutureLetter;
  onOpen?: () => void;
  isPreview?: boolean;
  className?: string;
}

export const Envelope: React.FC<EnvelopeProps> = ({
  letter,
  onOpen,
  isPreview = false,
  className = '',
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(letter.status !== 'sealed');

  const moodInfo = MOOD_OPTIONS.find((m) => m.value === letter.mood);
  const presetInfo = LETTER_TIME_PRESETS.find((p) => p.value === letter.preset);
  const isUnlocked = letter.status !== 'sealed';
  const daysToDelivery = daysUntil(letter.deliveryDate);

  const handleClick = () => {
    if (!isUnlocked || isPreview) return;

    if (!isOpened) {
      setIsOpening(true);
      setTimeout(() => {
        setIsOpening(false);
        setIsOpened(true);
        onOpen?.();
      }, 1200);
    } else {
      onOpen?.();
    }
  };

  if (isOpened && !isPreview) {
    return (
      <div
        className={cn(
          'bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100',
          'animate-fade-in',
          className
        )}
      >
        <div className="bg-gradient-to-r from-orange-50 to-rose-50 p-4 border-b border-orange-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{moodInfo?.emoji}</span>
              <div>
                <p className="text-sm text-gray-500">
                  来自 {letter.isAnonymous ? '匿名同事' : letter.authorName}
                </p>
                <p className="text-xs text-orange-500">
                  {letter.recipient === 'self' ? '写给未来的自己' : '来自未来的信'}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-full">
              {formatDate(letter.deliveryDate)} 送达
            </span>
          </div>
        </div>
        <div className="p-5">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {letter.content}
          </p>
          {letter.photo && (
            <div className="mt-4 rounded-xl overflow-hidden">
              <img
                src={letter.photo}
                alt="Letter photo"
                className="w-full h-48 object-cover"
              />
            </div>
          )}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
            <span>写信日期：{formatDate(letter.createdAt)}</span>
            {letter.unlockedAt && (
              <span>解锁日期：{formatDate(letter.unlockedAt)}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative cursor-pointer transition-all duration-300',
        isUnlocked && !isPreview && 'hover:scale-105',
        !isUnlocked && 'opacity-90',
        className
      )}
    >
      <div
        className={cn(
          'relative bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl shadow-lg overflow-hidden',
          'border-2 border-amber-300',
          isOpening && 'animate-shake',
          'min-h-[200px]'
        )}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-amber-200 to-transparent transform origin-top" />
          <div className="absolute top-1/2 left-0 w-full h-1/2 bg-gradient-to-t from-amber-300 to-transparent" />
        </div>

        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-amber-200 to-amber-100 border-b-2 border-amber-300 border-dashed transform origin-top transition-transform duration-500"
          style={{
            transform: isOpening ? 'rotateX(180deg)' : 'rotateX(0deg)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
          <div
            className={cn(
              'w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600',
              'flex items-center justify-center shadow-lg mb-4',
              'transition-all duration-300',
              isOpening ? 'scale-150 opacity-0' : 'scale-100',
              'animate-pulse-slow'
            )}
          >
            <span className="text-white text-2xl font-serif">封</span>
          </div>

          <div className="text-center">
            <p className="text-amber-800 font-medium mb-1">
              {letter.isAnonymous ? '来自匿名同事' : `来自 ${letter.authorName}`}
            </p>
            <p className="text-amber-600 text-sm mb-2">
              {letter.recipient === 'self' ? '给未来的自己' : '给 ' + (letter.recipient === 'colleague' ? 'TA' : '自己')}
            </p>
            <div className="flex items-center justify-center gap-1 text-amber-700">
              <span>{presetInfo?.emoji}</span>
              <span className="text-xs">
                {isUnlocked
                  ? '已送达，点击查看'
                  : daysToDelivery > 0
                  ? `还有 ${daysToDelivery} 天送达`
                  : '今天送达，点击查看'}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-lg">{moodInfo?.emoji}</span>
            <span className="text-xs text-amber-600">{moodInfo?.label}</span>
          </div>
        </div>

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center pointer-events-none',
            'transition-opacity duration-500',
            isOpening ? 'opacity-100' : 'opacity-0'
          )}
        >
          <div className="text-center">
            <div className="text-4xl animate-bounce">✨</div>
            <p className="text-amber-800 font-medium mt-2">正在拆封...</p>
          </div>
        </div>
      </div>

      {letter.photo && !isPreview && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center shadow-md">
          <span className="text-white text-xs">📷</span>
        </div>
      )}

      {letter.isPrivate && (
        <div className="absolute -top-2 -left-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
          <span className="text-white text-xs">🔒</span>
        </div>
      )}
    </div>
  );
};

interface EnvelopePreviewProps {
  content: string;
  authorName: string;
  isAnonymous: boolean;
  mood: MoodType;
  deliveryDate: string;
  recipient: 'colleague' | 'self';
  photo?: string;
}

export const EnvelopePreview: React.FC<EnvelopePreviewProps> = ({
  content,
  authorName,
  isAnonymous,
  mood,
  deliveryDate,
  recipient,
  photo,
}) => {
  const moodInfo = MOOD_OPTIONS.find((m) => m.value === mood);
  const daysToDelivery = daysUntil(deliveryDate);

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl shadow-lg overflow-hidden border-2 border-amber-300 p-6">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg mb-4">
            <span className="text-white text-xl font-serif">封</span>
          </div>

          <div className="text-center mb-4">
            <p className="text-amber-800 font-medium">
              {isAnonymous ? '来自匿名同事' : `来自 ${authorName}`}
            </p>
            <p className="text-amber-600 text-sm mt-1">
              {recipient === 'self' ? '给未来的自己' : '给 TA'}
            </p>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{moodInfo?.emoji}</span>
            <span className="text-sm text-amber-700">{moodInfo?.label}</span>
          </div>

          <div className="bg-white/60 rounded-xl px-4 py-2 text-center">
            <p className="text-amber-800 text-sm font-medium">
              {daysToDelivery > 0
                ? `将在 ${daysToDelivery} 天后送达`
                : '今天送达'}
            </p>
            <p className="text-amber-600 text-xs mt-1">
              {formatDate(deliveryDate)}
            </p>
          </div>

          {photo && (
            <div className="mt-4 w-16 h-16 rounded-lg overflow-hidden border-2 border-amber-300">
              <img src={photo} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="mt-4 w-full">
            <p className="text-amber-700 text-xs text-center line-clamp-3">
              {content || '写下你的祝福...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
