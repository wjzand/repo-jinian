import React, { useState, useMemo } from 'react';
import { Plus, Filter } from 'lucide-react';
import { MessageCard } from '@/components/MessageCard';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { PhotoUpload } from '@/components/PhotoUpload';
import { EmptyState } from '@/components/EmptyState';
import { useBookStore } from '@/store/useBookStore';
import type { MoodType } from '@/types';
import { MOOD_OPTIONS } from '@/types';
import { cn } from '@/lib/utils';

export const MessagesPage: React.FC = () => {
  const { messages, isAdmin, userInfo, addMessage, likeMessage, thankMessage, deleteMessage } =
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
        </div>
      </Modal>
    </div>
  );
};
