import React, { useState, useEffect } from 'react';
import type { FutureLetter } from '@/types';
import { getMoodInfo, getLetterPresetInfo, getLetterStatusInfo } from '@/types';
import { formatDateCN, formatDateTime } from '@/utils/date';
import { Avatar } from '@/components/Avatar';
import { X } from 'lucide-react';

interface LetterDetailModalProps {
  letter: FutureLetter | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (letterId: string) => void;
}

export const LetterDetailModal: React.FC<LetterDetailModalProps> = ({
  letter,
  isOpen,
  onClose,
  onMarkAsRead,
}) => {
  const [unlockStage, setUnlockStage] = useState<number>(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen && letter) {
      if (letter.status === 'unlocked') {
        setUnlockStage(0);
        setShowContent(false);
        
        const timer1 = setTimeout(() => setUnlockStage(1), 300);
        const timer2 = setTimeout(() => setUnlockStage(2), 800);
        const timer3 = setTimeout(() => setUnlockStage(3), 1300);
        const timer4 = setTimeout(() => {
          setShowContent(true);
          onMarkAsRead?.(letter.id);
        }, 1800);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
          clearTimeout(timer3);
          clearTimeout(timer4);
        };
      } else if (letter.status === 'read') {
        setShowContent(true);
        setUnlockStage(3);
      }
    }
  }, [isOpen, letter, onMarkAsRead]);

  if (!letter) return null;

  const moodInfo = getMoodInfo(letter.mood);
  const presetInfo = getLetterPresetInfo(letter.preset);
  const statusInfo = getLetterStatusInfo(letter.status);

  const handleClose = () => {
    setUnlockStage(0);
    setShowContent(false);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-[70] flex items-center justify-center ${isOpen ? '' : 'pointer-events-none'}`}>
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      
      <div className={`relative w-full max-w-md mx-4 max-h-[85vh] overflow-hidden transition-all duration-500 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {!showContent && letter.status !== 'read' ? (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div 
                  className={`absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full transition-all duration-700 ${unlockStage >= 1 ? 'scale-110 opacity-30' : 'scale-100'}`}
                />
                <div 
                  className={`absolute inset-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl transition-all duration-700 ${unlockStage >= 1 ? 'animate-pulse' : ''}`}
                  style={{
                    boxShadow: unlockStage >= 1 
                      ? '0 8px 40px rgba(251, 146, 60, 0.6)' 
                      : '0 4px 20px rgba(251, 146, 60, 0.4)'
                  }}
                >
                  <span className={`text-5xl transition-all duration-500 ${unlockStage >= 2 ? 'scale-125' : ''}`}>
                    {unlockStage >= 2 ? '💌' : '🔒'}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {unlockStage >= 2 ? '信件开启中...' : '正在解锁信件'}
              </h3>
              
              <p className="text-gray-500 text-sm">
                {unlockStage === 0 && '火漆印章碎裂中...'}
                {unlockStage === 1 && '信封缓缓打开...'}
                {unlockStage === 2 && '信纸展开中...'}
                {unlockStage === 3 && '即将呈现...'}
              </p>

              <div className="mt-6 flex justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <div 
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${
                      unlockStage > i 
                        ? 'bg-amber-500 scale-100' 
                        : 'bg-amber-200 scale-75'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
            <div 
              className="relative p-6"
              style={{
                background: `linear-gradient(135deg, ${moodInfo.color}20 0%, #fff 50%)`
              }}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <Avatar 
                  name={letter.isAnonymous ? '匿' : letter.authorName} 
                  size="lg"
                />
                <div>
                  <p className="font-bold text-gray-800 text-lg">
                    {letter.isAnonymous ? '匿名同事' : letter.authorName}
                  </p>
                  <p className="text-sm text-gray-500">
                    写给{letter.recipient === 'self' ? '未来的自己' : letter.authorName}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span 
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: `${moodInfo.color}20`, color: moodInfo.color }}
                >
                  {moodInfo.emoji} {moodInfo.label}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                  {presetInfo.emoji} {presetInfo.label}
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                  {statusInfo.icon} {statusInfo.label}
                </span>
              </div>

              <div className="text-sm text-gray-400 mb-2">
                <p>📅 送达日期：{formatDateCN(letter.deliveryDate)}</p>
                <p>🕐 写信时间：{formatDateTime(letter.createdAt)}</p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {letter.photo && (
                <div className="mb-4 rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={letter.photo} 
                    alt="信件照片" 
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              <div className="relative">
                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-300 via-amber-200 to-amber-100 rounded-full" />
                <div className="pl-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                    {letter.content}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <span>💌</span>
                  <span>来自{formatDateCN(letter.createdAt)}的一封信</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
