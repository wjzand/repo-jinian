import React, { useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { MomentCard } from '@/components/MomentCard';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { PhotoUpload } from '@/components/PhotoUpload';
import { EmptyState } from '@/components/EmptyState';
import { useBookStore } from '@/store/useBookStore';
import type { MomentType, Moment } from '@/types';
import { MOMENT_TYPE_OPTIONS } from '@/types';
import { formatDateCN, getTodayString } from '@/utils/date';
import { cn } from '@/lib/utils';

export const TimelinePage: React.FC = () => {
  const { moments, isAdmin, addMoment, updateMoment, deleteMoment } = useBookStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [editingMoment, setEditingMoment] = useState<{
    date: string;
    title: string;
    description: string;
    type: MomentType;
    photos: string[];
  }>({
    date: getTodayString(),
    title: '',
    description: '',
    type: 'other',
    photos: [],
  });

  const openAddModal = () => {
    setEditingMoment({
      date: getTodayString(),
      title: '',
      description: '',
      type: 'other',
      photos: [],
    });
    setShowAddModal(true);
  };

  const openDetailModal = (moment: Moment) => {
    setSelectedMoment(moment);
    setCurrentPhotoIndex(0);
    setShowDetailModal(true);
  };

  const openEditModal = (moment: Moment) => {
    setEditingMoment({
      date: moment.date,
      title: moment.title,
      description: moment.description,
      type: moment.type,
      photos: moment.photos,
    });
    setSelectedMoment(moment);
    setShowAddModal(true);
  };

  const handleSubmit = () => {
    if (!editingMoment.title.trim()) return;

    if (selectedMoment) {
      updateMoment(selectedMoment.id, editingMoment);
    } else {
      addMoment(editingMoment);
    }

    setShowAddModal(false);
    setSelectedMoment(null);
  };

  const handleAddPhoto = (photo: string) => {
    if (editingMoment.photos.length < 9) {
      setEditingMoment({
        ...editingMoment,
        photos: [...editingMoment.photos, photo],
      });
    }
  };

  const handleRemovePhoto = (index: number) => {
    setEditingMoment({
      ...editingMoment,
      photos: editingMoment.photos.filter((_, i) => i !== index),
    });
  };

  const handleDeleteMoment = (momentId: string) => {
    if (confirm('确定要删除这个时刻吗？')) {
      deleteMoment(momentId);
    }
  };

  const nextPhoto = () => {
    if (selectedMoment && currentPhotoIndex < selectedMoment.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="safe-area-top bg-gradient-to-b from-emerald-50 to-transparent sticky top-0 z-30">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 mb-1">时光轴</h1>
          <p className="text-sm text-gray-500">
            共事期间的 {moments.length} 个重要时刻
          </p>
        </div>
      </div>

      {moments.length === 0 ? (
        <EmptyState
          icon="📸"
          title="还没有回忆"
          description="添加第一个共事的美好时刻吧"
          action={
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4" />
              添加时刻
            </Button>
          }
        />
      ) : (
        <div className="px-4 pt-2">
          <div className="relative pl-2">
            <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-300 via-rose-300 to-pink-300" />

            {moments.map((moment, index) => (
              <MomentCard
                key={moment.id}
                moment={moment}
                isAdmin={isAdmin}
                onClick={() => openDetailModal(moment)}
                onEdit={() => openEditModal(moment)}
                onDelete={() => handleDeleteMoment(moment.id)}
                style={{ animationDelay: `${index * 50}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <button
          onClick={openAddModal}
          className="fixed right-4 bottom-20 w-14 h-14 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-full shadow-lg shadow-emerald-200 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all z-40"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedMoment(null);
        }}
        title={selectedMoment ? '编辑时刻' : '添加时刻'}
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日期
            </label>
            <input
              type="date"
              value={editingMoment.date}
              onChange={(e) =>
                setEditingMoment({ ...editingMoment, date: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              事件类型
            </label>
            <div className="flex flex-wrap gap-2">
              {MOMENT_TYPE_OPTIONS.map((type) => (
                <button
                  key={type.value}
                  onClick={() =>
                    setEditingMoment({ ...editingMoment, type: type.value })
                  }
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-all',
                    editingMoment.type === type.value
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {type.emoji} {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标题
            </label>
            <input
              type="text"
              value={editingMoment.title}
              onChange={(e) =>
                setEditingMoment({ ...editingMoment, title: e.target.value })
              }
              placeholder="给这个时刻起个名字"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent text-sm"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述
            </label>
            <textarea
              value={editingMoment.description}
              onChange={(e) =>
                setEditingMoment({ ...editingMoment, description: e.target.value })
              }
              placeholder="描述一下这个时刻..."
              className="w-full h-28 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent resize-none text-sm"
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              照片 (最多9张)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {editingMoment.photos.map((photo, idx) => (
                <div key={idx} className="relative aspect-square">
                  <img
                    src={photo}
                    alt={`照片${idx + 1}`}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {editingMoment.photos.length < 9 && (
                <PhotoUpload
                  value=""
                  onChange={handleAddPhoto}
                  className="aspect-square"
                />
              )}
            </div>
          </div>

          <Button fullWidth onClick={handleSubmit} disabled={!editingMoment.title.trim()}>
            {selectedMoment ? '保存修改' : '添加时刻'}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedMoment(null);
        }}
      >
        {selectedMoment && (
          <div className="p-6">
            {selectedMoment.photos.length > 0 && (
              <div className="relative mb-4 -mx-6 -mt-6">
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={selectedMoment.photos[currentPhotoIndex]}
                    alt={selectedMoment.title}
                    className="w-full h-full object-contain"
                  />
                  {selectedMoment.photos.length > 1 && (
                    <>
                      <button
                        onClick={prevPhoto}
                        className={cn(
                          'absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 text-white rounded-full flex items-center justify-center',
                          currentPhotoIndex === 0 && 'opacity-30'
                        )}
                        disabled={currentPhotoIndex === 0}
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextPhoto}
                        className={cn(
                          'absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 text-white rounded-full flex items-center justify-center',
                          currentPhotoIndex === selectedMoment.photos.length - 1 &&
                            'opacity-30'
                        )}
                        disabled={currentPhotoIndex === selectedMoment.photos.length - 1}
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                  {selectedMoment.photos.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {selectedMoment.photos.map((_, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'w-2 h-2 rounded-full transition-all',
                            idx === currentPhotoIndex
                              ? 'bg-white w-6'
                              : 'bg-white/50'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">
                {MOMENT_TYPE_OPTIONS.find((t) => t.value === selectedMoment.type)?.emoji}
              </span>
              <span className="text-sm font-medium px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                {MOMENT_TYPE_OPTIONS.find((t) => t.value === selectedMoment.type)?.label}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {selectedMoment.title}
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              {formatDateCN(selectedMoment.date)}
            </p>

            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {selectedMoment.description}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};
