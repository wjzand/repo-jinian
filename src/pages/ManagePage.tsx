import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Settings,
  Edit3,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  Palette,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { PhotoUpload } from '@/components/PhotoUpload';
import { Avatar } from '@/components/Avatar';
import { useBookStore } from '@/store/useBookStore';
import { THEME_OPTIONS } from '@/types';
import { formatDateCN } from '@/utils/date';
import { cn } from '@/lib/utils';

export const ManagePage: React.FC = () => {
  const navigate = useNavigate();
  const { books, currentBook, isAdmin, loadBook, updateBook, deleteBook, createBook } =
    useBookStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    nickname: '',
    bio: '',
    joinDate: '',
    leaveDate: '',
    avatar: '',
  });

  const openEditModal = () => {
    if (!currentBook) return;
    setEditData({
      name: currentBook.name,
      nickname: currentBook.nickname,
      bio: currentBook.bio,
      joinDate: currentBook.joinDate,
      leaveDate: currentBook.leaveDate,
      avatar: currentBook.avatar,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editData.name.trim()) return;
    updateBook(editData);
    setShowEditModal(false);
  };

  const handleThemeChange = (theme: string) => {
    updateBook({ theme: theme as any });
    setShowThemeModal(false);
  };

  const handleDeleteBook = () => {
    if (!currentBook) return;
    deleteBook(currentBook.id);
    setShowDeleteConfirm(false);
    navigate('/');
  };

  const handleSwitchBook = (bookId: string) => {
    loadBook(bookId);
    navigate('/');
  };

  const handleCreateBook = () => {
    navigate('/create');
  };

  if (!currentBook) return null;

  return (
    <div className="min-h-screen pb-24 bg-gray-50">
      <div className="safe-area-top bg-white sticky top-0 z-30 shadow-sm">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 ml-2">纪念册管理</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-500" />
            当前纪念册
          </h3>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
            <Avatar src={currentBook.avatar} name={currentBook.name} size="lg" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-800 truncate">
                {currentBook.name}
              </h4>
              <p className="text-sm text-gray-500 truncate">
                {currentBook.nickname || '暂无昵称'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDateCN(currentBook.joinDate)} -{' '}
                {formatDateCN(currentBook.leaveDate)}
              </p>
            </div>
            {isAdmin && (
              <div className="px-2 py-1 bg-orange-100 text-orange-500 text-xs rounded-full">
                管理员
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <h3 className="px-4 pt-4 font-semibold text-gray-800">档案设置</h3>
              <div className="divide-y divide-gray-100">
                <button
                  onClick={openEditModal}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-gray-800">编辑档案信息</div>
                    <div className="text-xs text-gray-400">修改姓名、日期、简介等</div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-gray-300 rotate-180" />
                </button>

                <button
                  onClick={() => setShowThemeModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-gray-800">主题风格</div>
                    <div className="text-xs text-gray-400">
                      当前：
                      {THEME_OPTIONS.find((t) => t.value === currentBook.theme)?.label ||
                        '温暖橙'}
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-gray-300 rotate-180" />
                </button>

                <button
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors opacity-50"
                  disabled
                >
                  <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-gray-800">访问密码</div>
                    <div className="text-xs text-gray-400">设置密码保护纪念册</div>
                  </div>
                  <span className="text-xs text-gray-400">未设置</span>
                </button>

                <button
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors opacity-50"
                  disabled
                >
                  <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-gray-800">留言审核</div>
                    <div className="text-xs text-gray-400">新留言需要审核后展示</div>
                  </div>
                  <span className="text-xs text-gray-400">关闭</span>
                </button>
              </div>
            </div>
          </>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4">
            <h3 className="font-semibold text-gray-800">我的纪念册</h3>
            <button
              onClick={handleCreateBook}
              className="text-orange-500 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              新建
            </button>
          </div>
          <div className="p-4 space-y-2">
            {books.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">暂无纪念册</p>
            ) : (
              books.map((book) => (
                <button
                  key={book.id}
                  onClick={() => handleSwitchBook(book.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
                    book.id === currentBook.id
                      ? 'bg-orange-50 ring-2 ring-orange-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  <Avatar src={book.avatar} name={book.name} size="md" />
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="font-medium text-gray-800 truncate text-sm">
                      {book.name}
                    </h4>
                    <p className="text-xs text-gray-400 truncate">
                      {formatDateCN(book.joinDate)} - {formatDateCN(book.leaveDate)}
                    </p>
                  </div>
                  {book.id === currentBook.id && (
                    <span className="text-xs text-orange-500 font-medium">当前</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white rounded-2xl text-red-500 hover:bg-red-50 transition-colors shadow-sm"
          >
            <Trash2 className="w-5 h-5" />
            删除当前纪念册
          </button>
        )}

        <div className="text-center pt-4">
          <p className="text-xs text-gray-400">
            数据存储在本地浏览器中，请勿清除浏览器数据
          </p>
          <p className="text-xs text-gray-300 mt-1">v1.0.0</p>
        </div>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑档案"
      >
        <div className="p-6 space-y-4">
          <div className="flex justify-center">
            <PhotoUpload
              value={editData.avatar}
              onChange={(photo) => setEditData({ ...editData, avatar: photo })}
              onRemove={() => setEditData({ ...editData, avatar: '' })}
              className="w-24 h-24 !rounded-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              姓名
            </label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              placeholder="离职同事姓名"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              昵称
            </label>
            <input
              type="text"
              value={editData.nickname}
              onChange={(e) =>
                setEditData({ ...editData, nickname: e.target.value })
              }
              placeholder="大家对TA的称呼"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                入职日期
              </label>
              <input
                type="date"
                value={editData.joinDate}
                onChange={(e) =>
                  setEditData({ ...editData, joinDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                离职日期
              </label>
              <input
                type="date"
                value={editData.leaveDate}
                onChange={(e) =>
                  setEditData({ ...editData, leaveDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              一句话简介
            </label>
            <textarea
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              placeholder="简短介绍一下TA..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm resize-none h-20"
              maxLength={100}
            />
          </div>

          <Button fullWidth onClick={handleSaveEdit} disabled={!editData.name.trim()}>
            保存修改
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        title="选择主题"
      >
        <div className="p-6 space-y-3">
          {THEME_OPTIONS.map((theme) => (
            <button
              key={theme.value}
              onClick={() => handleThemeChange(theme.value)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
                currentBook.theme === theme.value
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-100 hover:border-gray-200'
              )}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.gradient}`}
              />
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-800">{theme.label}</div>
                <div className="text-xs text-gray-400">
                  {theme.value === 'warm' && '温暖治愈，适合告别场景'}
                  {theme.value === 'fresh' && '清新自然，充满活力'}
                  {theme.value === 'simple' && '简约大方，经典耐看'}
                </div>
              </div>
              {currentBook.theme === theme.value && (
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="确认删除"
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            确定要删除这本纪念册吗？
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            删除后所有数据将无法恢复，包括留言、照片和时光轴记录
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDeleteConfirm(false)}
            >
              取消
            </Button>
            <Button fullWidth onClick={handleDeleteBook} className="!bg-red-500">
              确认删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
