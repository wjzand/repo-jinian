import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MailOpen, Clock, Plus, ChevronLeft } from 'lucide-react';
import { useBookStore } from '@/store/useBookStore';
import type { FutureLetter, MailboxTabType } from '@/types';
import { isLetterUnlocked } from '@/types';
import { LetterCard } from '@/components/LetterCard';
import { LetterDetailModal } from '@/components/LetterDetailModal';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/utils/helpers';

export const MailboxPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    letters,
    currentBook,
    isAdmin,
    userInfo,
    deleteLetter,
    markLetterAsRead,
    checkAndUnlockLetters,
  } = useBookStore();

  const [activeTab, setActiveTab] = useState<MailboxTabType>('delivered');
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<FutureLetter | null>(null);

  const selectedLetter = useMemo(() => {
    if (!selectedLetterId) return null;
    return letters.find((l) => l.id === selectedLetterId) || null;
  }, [selectedLetterId, letters]);

  useEffect(() => {
    checkAndUnlockLetters();
  }, [checkAndUnlockLetters]);

  if (!currentBook) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-rose-50 flex items-center justify-center">
        <p className="text-gray-500">请先选择一本纪念册</p>
      </div>
    );
  }

  const visibleLetters = letters.filter((l) => {
    if (l.isPrivate && !isAdmin) return false;
    return true;
  });

  const deliveredLetters = visibleLetters.filter((l) => isLetterUnlocked(l));
  const pendingLetters = visibleLetters.filter((l) => !isLetterUnlocked(l));

  const currentLetters = activeTab === 'delivered' ? deliveredLetters : pendingLetters;

  const handleLetterClick = (letter: FutureLetter) => {
    if (letter.status === 'sealed') return;

    if (letter.isPrivate && !isAdmin) return;

    setSelectedLetterId(letter.id);
    setShowDetail(true);
  };

  const handleEditLetter = (letter: FutureLetter) => {
    if (letter.authorName !== userInfo?.name && !letter.isAnonymous) return;
    navigate(`/mailbox/write?edit=${letter.id}`);
  };

  const handleDeleteLetter = (letter: FutureLetter) => {
    const isAuthor = !letter.isAnonymous && letter.authorName === userInfo?.name;
    if (!isAuthor && !isAdmin) return;

    setDeleteConfirm(letter);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteLetter(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const canWriteSelf = isAdmin;

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
          <h1 className="text-lg font-bold text-gray-800">未来信箱</h1>
          <div className="w-10" />
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setActiveTab('delivered')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
              activeTab === 'delivered'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <MailOpen className="w-4 h-4" />
            已送达 ({deliveredLetters.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
              activeTab === 'pending'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <Clock className="w-4 h-4" />
            待送达 ({pendingLetters.length})
          </button>
        </div>
      </div>

      <div className="p-4 pb-24">
        <div className="flex gap-3 mb-6">
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/mailbox/write')}
          >
            <Plus className="w-4 h-4 mr-2" />
            写给未来的 TA
          </Button>
          {canWriteSelf && (
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/mailbox/write?self=1')}
            >
              <Mail className="w-4 h-4 mr-2" />
              写给自己
            </Button>
          )}
        </div>

        {activeTab === 'delivered' && deliveredLetters.length > 0 && (
          <div className="mb-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 animate-fade-in">
            <p className="text-sm text-emerald-700">
              ✨ 你有 <span className="font-bold">{deliveredLetters.length}</span> 封来自过去的信件，点击查看吧！
            </p>
          </div>
        )}

        {activeTab === 'pending' && pendingLetters.length > 0 && (
          <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-100 animate-fade-in">
            <p className="text-sm text-amber-700">
              ⏳ 还有 <span className="font-bold">{pendingLetters.length}</span> 封时间信封正在穿越时光的路上...
            </p>
          </div>
        )}

        {currentLetters.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              icon={activeTab === 'delivered' ? '📬' : '✉️'}
              title={activeTab === 'delivered' ? '暂无已送达的信件' : '暂无待送达的信件'}
              description={
                activeTab === 'delivered'
                  ? '时间信封还在路上，耐心等待它们到达吧'
                  : '写一封给未来的信，封存此刻的心意'
              }
              actionText="写一封未来的信"
              onAction={() => navigate('/mailbox/write')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {currentLetters.map((letter, index) => (
              <LetterCard
                key={letter.id}
                letter={letter}
                isAdmin={isAdmin}
                isAuthor={
                  (!letter.isAnonymous && letter.authorName === userInfo?.name) || isAdmin
                }
                onClick={() => handleLetterClick(letter)}
                onEdit={() => handleEditLetter(letter)}
                onDelete={() => handleDeleteLetter(letter)}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      <LetterDetailModal
        letter={selectedLetter}
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedLetterId(null);
        }}
        onMarkAsRead={(id) => markLetterAsRead(id)}
      />

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除"
      >
        <div className="p-4 space-y-4">
          <p className="text-gray-600">
            确定要删除这封信吗？删除后将无法恢复。
          </p>
          {deleteConfirm && (
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">
                {deleteConfirm.isAnonymous ? '匿名同事' : deleteConfirm.authorName} 的信
              </p>
              <p className="text-xs text-gray-400 mt-1">
                送达日期：{deleteConfirm.deliveryDate}
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setDeleteConfirm(null)}>
              取消
            </Button>
            <Button variant="danger" fullWidth onClick={confirmDelete}>
              确认删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
