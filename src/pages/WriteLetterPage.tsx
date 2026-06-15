import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Send, Sparkles, Calendar, Lock } from 'lucide-react';
import { useBookStore } from '@/store/useBookStore';
import type { MoodType, LetterTimePreset, LetterRecipient } from '@/types';
import { MOOD_OPTIONS, LETTER_TIME_PRESETS, getMoodInfo, getLetterPresetInfo } from '@/types';
import { PhotoUpload } from '@/components/PhotoUpload';
import { Button } from '@/components/Button';
import { addDays, formatDateCN, getTodayString, daysBetween, getNextBirthday, getNextAnniversary, isPastDate } from '@/utils/date';
import { cn } from '@/utils/helpers';

export const WriteLetterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentBook, addLetter, userInfo, updateLetter, letters } = useBookStore();
  
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('edit');
  const editingLetter = editId ? letters.find(l => l.id === editId) : null;
  
  const [step, setStep] = useState<'content' | 'time' | 'preview'>('content');
  const [content, setContent] = useState(editingLetter?.content || '');
  const [photo, setPhoto] = useState(editingLetter?.photo || '');
  const [mood, setMood] = useState<MoodType>(editingLetter?.mood || 'bless');
  const [authorName, setAuthorName] = useState(editingLetter?.authorName || userInfo?.name || '');
  const [isAnonymous, setIsAnonymous] = useState(editingLetter?.isAnonymous || false);
  const [recipient, setRecipient] = useState<LetterRecipient>(editingLetter?.recipient || 'colleague');
  const [preset, setPreset] = useState<LetterTimePreset>(editingLetter?.preset || 'month');
  const [customDate, setCustomDate] = useState(editingLetter?.deliveryDate || '');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isAdmin = useBookStore(state => state.isAdmin);
  const canWriteSelf = isAdmin;

  useEffect(() => {
    if (editingLetter) {
      setContent(editingLetter.content);
      setPhoto(editingLetter.photo);
      setMood(editingLetter.mood);
      setAuthorName(editingLetter.authorName);
      setIsAnonymous(editingLetter.isAnonymous);
      setRecipient(editingLetter.recipient);
      setPreset(editingLetter.preset);
      setCustomDate(editingLetter.deliveryDate);
    }
  }, [editingLetter]);

  const minDate = currentBook?.leaveDate || getTodayString();
  const maxDate = addDays(minDate, 365 * 2);

  const getDeliveryDate = (): string => {
    if (!currentBook) return getTodayString();
    
    switch (preset) {
      case 'week':
        return addDays(currentBook.leaveDate, 7);
      case 'month':
        return addDays(currentBook.leaveDate, 30);
      case 'threeMonths':
        return addDays(currentBook.leaveDate, 90);
      case 'halfYear':
        return addDays(currentBook.leaveDate, 180);
      case 'year':
        return addDays(currentBook.leaveDate, 365);
      case 'birthday':
        return getNextBirthday(currentBook.joinDate, currentBook.leaveDate);
      case 'anniversary':
        return getNextAnniversary(currentBook.joinDate, currentBook.leaveDate);
      case 'custom':
        return customDate || minDate;
      default:
        return addDays(currentBook.leaveDate, 30);
    }
  };

  const deliveryDate = getDeliveryDate();
  const daysToDelivery = daysBetween(getTodayString(), deliveryDate);
  const moodInfo = getMoodInfo(mood);
  const presetInfo = getLetterPresetInfo(preset);

  const canProceedToTime = content.trim().length > 0 && authorName.trim().length > 0;
  const canProceedToPreview = preset !== 'custom' || (customDate && isPastDate(minDate, customDate) && isPastDate(customDate, maxDate));

  const handleSubmit = () => {
    if (!currentBook) return;

    const letterData = {
      authorName: isAnonymous ? '匿名' : authorName,
      isAnonymous,
      mood,
      content: content.trim(),
      photo,
      recipient,
      deliveryDate,
      preset,
      isPrivate: recipient === 'self',
    };

    if (editingLetter) {
      updateLetter(editingLetter.id, letterData);
    } else {
      addLetter(letterData);
    }

    navigate('/mailbox');
  };

  useEffect(() => {
    const isSelf = queryParams.get('self') === '1';
    if (isSelf && canWriteSelf && !editingLetter) {
      setRecipient('self');
    }
  }, []);

  if (!currentBook) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-rose-50 flex items-center justify-center">
        <p className="text-gray-500">请先选择一本纪念册</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-rose-50 pb-safe-bottom">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">
            {editingLetter ? '修改信件' : '写一封未来的信'}
          </h1>
          <div className="w-10" />
        </div>

        <div className="flex items-center justify-center gap-2 mt-3">
          {[
            { key: 'content', label: '内容', num: 1 },
            { key: 'time', label: '时间', num: 2 },
            { key: 'preview', label: '预览', num: 3 },
          ].map((s) => (
            <React.Fragment key={s.key}>
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  step === s.key
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-gray-100 text-gray-500'
                )}
                onClick={() => {
                  if (s.key === 'content') setStep('content');
                  if (s.key === 'time' && canProceedToTime) setStep('time');
                  if (s.key === 'preview' && canProceedToTime && canProceedToPreview) setStep('preview');
                }}
              >
                <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                  {s.num}
                </span>
                {s.label}
              </div>
              {s.key !== 'preview' && (
                <div className="w-8 h-0.5 bg-gray-200" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="p-4">
        {step === 'content' && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                收信人
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRecipient('colleague')}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    recipient === 'colleague'
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div className="text-2xl mb-1">👥</div>
                  <p className="font-medium text-gray-800">写给 TA</p>
                  <p className="text-xs text-gray-500">给离职同事的信</p>
                </button>
                {canWriteSelf && (
                  <button
                    onClick={() => setRecipient('self')}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all text-left',
                      recipient === 'self'
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    <div className="text-2xl mb-1">💭</div>
                    <p className="font-medium text-gray-800">写给自己</p>
                    <p className="text-xs text-gray-500">给未来自己的信</p>
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                心情标签
              </label>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMood(option.value)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                      mood === option.value
                        ? 'text-white shadow-md scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                    style={{
                      backgroundColor: mood === option.value ? option.color : undefined,
                    }}
                  >
                    <span>{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                信件内容 <span className="text-red-400">*</span>
                <span className="text-gray-400 font-normal ml-2">
                  {content.length}/500
                </span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 500))}
                placeholder="写下你想对未来的TA说的话..."
                className="w-full h-40 p-4 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 resize-none text-gray-700 placeholder-gray-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                照片 (可选)
              </label>
              <PhotoUpload
                value={photo}
                onChange={setPhoto}
                placeholder="添加一张有意义的照片"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                你的名字 <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="请输入你的名字"
                  disabled={isAnonymous}
                  className="flex-1 p-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 text-gray-700 placeholder-gray-400 disabled:bg-gray-100 transition-all"
                />
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5',
                    isAnonymous
                      ? 'bg-orange-100 text-orange-600 border-2 border-orange-200'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent'
                  )}
                >
                  {isAnonymous ? '🔒' : '👤'}
                  匿名
                </button>
              </div>
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                fullWidth
                disabled={!canProceedToTime}
                onClick={() => setStep('time')}
              >
                下一步：选择送达时间
              </Button>
            </div>
          </div>
        )}

        {step === 'time' && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择送达时间
              </label>
              <p className="text-sm text-gray-500 mb-4">
                这封信将在设定的日期自动解锁，在此之前任何人都无法查看内容
              </p>

              <div className="space-y-3">
                {LETTER_TIME_PRESETS.slice(0, 5).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setPreset(option.value as LetterTimePreset);
                      setShowDatePicker(false);
                    }}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4',
                      preset === option.value
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{option.label}</p>
                      <p className="text-sm text-gray-500">
                        {formatDateCN(addDays(currentBook.leaveDate, option.days))}
                      </p>
                    </div>
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                      preset === option.value
                        ? 'border-orange-400 bg-orange-400'
                        : 'border-gray-300'
                    )}>
                      {preset === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  {LETTER_TIME_PRESETS.slice(5).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPreset(option.value as LetterTimePreset);
                        if (option.value === 'custom') {
                          setShowDatePicker(true);
                        } else {
                          setShowDatePicker(false);
                        }
                      }}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-center',
                        preset === option.value
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      )}
                    >
                      <span className="text-2xl block mb-1">{option.emoji}</span>
                      <p className="text-sm font-medium text-gray-800">{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {showDatePicker && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择日期
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 text-gray-700"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    日期范围：{formatDateCN(minDate)} - {formatDateCN(maxDate)}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-amber-700">时间信封预览</span>
              </div>
              
              <div className="bg-white/60 rounded-xl p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-500 text-sm">这封信将在</p>
                <p className="text-xl font-bold text-amber-600 my-1">
                  {formatDateCN(deliveryDate)}
                </p>
                <p className="text-gray-500 text-sm">
                  {daysToDelivery > 0 
                    ? `还有 ${daysToDelivery} 天送达` 
                    : '今天送达'
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setStep('content')}
              >
                上一步
              </Button>
              <Button
                variant="primary"
                fullWidth
                disabled={!canProceedToPreview}
                onClick={() => setStep('preview')}
              >
                预览信件
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                时间信封预览
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl overflow-hidden shadow-xl border-2 border-amber-200">
              <div className="p-6 border-b border-amber-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <span className="text-2xl">✉️</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">
                        {isAnonymous ? '匿名同事' : authorName}
                      </p>
                      <p className="text-sm text-gray-500">
                        写给{recipient === 'self' ? '未来的自己' : currentBook.name}
                      </p>
                    </div>
                  </div>
                  <span 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${moodInfo.color}20`, color: moodInfo.color }}
                  >
                    {moodInfo.emoji} {moodInfo.label}
                  </span>
                </div>
              </div>

              <div className="relative p-6">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl animate-pulse">
                    <span className="text-3xl">🔒</span>
                  </div>
                </div>
                
                <div className="opacity-30 pointer-events-none">
                  {photo && (
                    <div className="mb-4 rounded-xl overflow-hidden">
                      <img 
                        src={photo} 
                        alt="信件照片" 
                        className="w-full h-32 object-cover blur-sm"
                      />
                    </div>
                  )}
                  <p className="text-gray-700 leading-relaxed blur-sm">
                    {content}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-100/50 border-t border-amber-200/50">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-700">
                    {presetInfo.emoji} {presetInfo.label}
                  </span>
                </div>
                <p className="text-center text-amber-600 font-bold mt-1">
                  {formatDateCN(deliveryDate)}
                </p>
                <p className="text-center text-xs text-amber-500 mt-1">
                  {daysToDelivery > 0 
                    ? `还有 ${daysToDelivery} 天后开启`
                    : '今天开启'
                  }
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700">
                <span className="font-medium">🔒 隐私说明：</span>
                {recipient === 'self' 
                  ? '这是写给自己的私密信件，只有你本人可以查看。'
                  : '在设定日期到达前，这封信的内容对所有人都是隐藏的，包括管理员和你自己。'
                }
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setStep('time')}
              >
                上一步
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleSubmit}
              >
                <Send className="w-4 h-4 mr-2" />
                {editingLetter ? '保存修改' : '封存信件'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
