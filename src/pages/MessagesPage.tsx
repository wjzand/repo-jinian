import React, { useState, useMemo } from 'react';
import { Plus, Mail, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MessageCard } from '@/components/MessageCard';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { PhotoUpload } from '@/components/PhotoUpload';
import { EmptyState } from '@/components/EmptyState';
import { useBookStore } from '@/store/useBookStore';
import type { MoodType } from '@/types';
import { MOOD_OPTIONS } from '@/types';
import { cn } from '@/utils/helpers';

export const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { messages, letters, isAdmin, userInfo, addMessage, likeMessage, thankMessage, deleteMessage } =
    useBookStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType | 'all'>('all');
  const [newMessage, setNewMessage] = useState({
    content: '',
    mood: 'bless' as MoodType,
    authorName: '',
    isAnonymous: false,
    photo: '',
  });

  const approvedMessages = useMemo(
    () => messages.filter((m) => m.isApproved),
    [messages]
  );

  const filteredMessages = useMemo(() => {
    if (selectedMood === 'all') return approvedMessages;
    return approvedMessages.filter((m) => m.mood === selectedMood);
  }, [approvedMessages, selectedMood]);

  const unlockedLetterCount = useMemo(
    () => letters.filter((l) => l.status === 'unlocked').length,
    [letters]
  );

  const sealedLetterCount = useMemo(
    () => letters.filter((l) => l.status === 'sealed').length,
    [letters]
  );

  const handleSubmit = () => {
    if (!newMessage.content.trim()) return;

    addMessage({
      content: newMessage.content,
      mood: newMessage.mood,
      authorName: newMessage.isAnonymous ? '匿名同事' : newMessage.authorName || '匿名',
      isAnonymous: newMessage.isAnonymous,
      photo: newMessage.photo,
    });

    setShowAddModal(false);
    setNewMessage({
      content: '',
      mood: 'bless',
      authorName: '',
      isAnonymous: false,
      photo: '',
    });
  };

  const handleLike = (messageId: string) => {
    const userName = userInfo?.name || 'visitor';
    likeMessage(messageId, userName);
  };

  const handleThank = (messageId: string) => {
    const thankTexts = ['谢谢！❤️', '感谢你的祝福！', '收到，很感动～', '一起加油！'];
    const randomText = thankTexts[Math.floor(Math.random() * thankTexts.length)];
    thankMessage(messageId, randomText);
  };

  const hasLiked = (likedBy: string[]) => {
    const userName = userInfo?.name || 'visitor';
    return likedBy.includes(userName);
  };

  const topMessages = [...approvedMessages]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3);

  return (
    <div className="min-h-screen pb-24">
      <div className="safe-area-top bg-gradient-to-b from-orange-50 to-transparent sticky top-0 z-30 pb-2">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 mb-3">留言墙</h1>

          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-2">
            <button
              onClick={() => setSelectedMood('all')}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
                selectedMood === 'all'
                  ? 'bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              全部
            </button>
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  selectedMood === mood.value
                    ? 'bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                {mood.emoji} {mood.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {unlockedLetterCount > 0 && (
        <div className="px-4 mb-4">
          <button
            onClick={() => navigate('/mailbox')}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-amber-200/50 animate-pulse-glow"
          >
            <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-bold text-base">
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

      <div className="px-4 mb-4">
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/mailbox')}
            className="flex-1 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-3.5 flex items-center gap-3 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              📬
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-800">未来信箱</p>
              <p className="text-xs text-gray-500">
                {letters.length > 0
                  ? `${sealedLetterCount} 封在路上 · ${unlockedLetterCount} 封已送达`
                  : '写一封跨越时间的信'}
              </p>
            </div>
          </button>
          <button
            onClick={() => navigate('/mailbox/write')}
            className="flex-1 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/50 rounded-2xl p-3.5 flex items-center gap-3 hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
              ✉️
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-800">写给未来的TA</p>
              <p className="text-xs text-gray-500">设定时间，封存惊喜</p>
            </div>
          </button>
        </div>
      </div>

      {topMessages.length >= 3 && selectedMood === 'all' && (
        <div className="px-4 mb-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏆</span>
              <h3 className="font-semibold text-gray-800">最受欢迎祝福</h3>
            </div>
            <div className="space-y-2">
              {topMessages.slice(0, 1).map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white/80 rounded-xl p-3 text-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">
                      {msg.isAnonymous ? '匿名同事' : msg.authorName}
                    </span>
                    <span className="text-amber-500 text-xs">TOP 1</span>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{msg.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {filteredMessages.length === 0 ? (
        <EmptyState
          icon="💌"
          title="暂无留言"
          description="成为第一个留下祝福的人吧"
          action={
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" />
              写下祝福
            </Button>
          }
        />
      ) : (
        <div className="px-4">
          <div className="grid grid-cols-2 gap-3">
            {filteredMessages.map((message, index) => (
              <MessageCard
                key={message.id}
                message={message}
                onLike={() => handleLike(message.id)}
                hasLiked={hasLiked(message.likedBy)}
                isAdmin={isAdmin}
                onThank={() => handleThank(message.id)}
                onDelete={() => deleteMessage(message.id)}
                style={{ animationDelay: `${index * 50}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed right-4 bottom-20 w-14 h-14 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-full shadow-lg shadow-orange-200 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="写下你的祝福"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              心情标签
            </label>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setNewMessage({ ...newMessage, mood: mood.value })}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-all',
                    newMessage.mood === mood.value
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                  style={{
                    background:
                      newMessage.mood === mood.value
                        ? `linear-gradient(135deg, ${mood.color}, ${mood.color}dd)`
                        : undefined,
                  }}
                >
                  {mood.emoji} {mood.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              留言内容
            </label>
            <textarea
              value={newMessage.content}
              onChange={(e) =>
                setNewMessage({ ...newMessage, content: e.target.value })
              }
              placeholder="写下你想说的话..."
              className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent resize-none text-sm"
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {newMessage.content.length}/500
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上传照片 (可选)
            </label>
            <PhotoUpload
              value={newMessage.photo}
              onChange={(photo) => setNewMessage({ ...newMessage, photo })}
              onRemove={() => setNewMessage({ ...newMessage, photo: '' })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              你的名字
            </label>
            <input
              type="text"
              value={newMessage.authorName}
              onChange={(e) =>
                setNewMessage({ ...newMessage, authorName: e.target.value })
              }
              placeholder="请输入你的名字"
              disabled={newMessage.isAnonymous}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setNewMessage({ ...newMessage, isAnonymous: !newMessage.isAnonymous })
              }
              className={cn(
                'w-12 h-7 rounded-full transition-colors relative',
                newMessage.isAnonymous ? 'bg-orange-400' : 'bg-gray-200'
              )}
            >
              <div
                className={cn(
                  'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform',
                  newMessage.isAnonymous ? 'translate-x-5' : 'translate-x-0.5'
                )}
              />
            </button>
            <span className="text-sm text-gray-600">匿名留言</span>
          </div>

          <Button
            fullWidth
            onClick={handleSubmit}
            disabled={!newMessage.content.trim()}
          >
            发送祝福
          </Button>

          <button
            onClick={() => {
              setShowAddModal(false);
              navigate('/mailbox/write');
            }}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-amber-600 hover:text-amber-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            或写一封未来信件 →
          </button>
        </div>
      </Modal>
    </div>
  );
};
