import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/Button';
import { PhotoUpload } from '@/components/PhotoUpload';
import { Avatar } from '@/components/Avatar';
import { useBookStore } from '@/store/useBookStore';
import { getTodayString, addDays } from '@/utils/date';

const steps = [
  { title: '基本信息', description: '填写离职同事的信息' },
  { title: '完成创建', description: '纪念册准备好了' },
];

export const CreateBookPage: React.FC = () => {
  const navigate = useNavigate();
  const { createBook } = useBookStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    avatar: '',
    joinDate: getTodayString(),
    leaveDate: addDays(getTodayString(), 30),
    bio: '',
    theme: 'warm' as const,
  });

  const handleNext = () => {
    if (!formData.name.trim()) return;
    setCurrentStep(1);
  };

  const handleCreate = () => {
    const newBook = createBook(formData);
    navigate(`/`);
  };

  const handleUseSample = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-rose-50">
      <div className="safe-area-top">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 ml-2">创建纪念册</h1>
        </div>

        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    idx <= currentStep
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {idx < currentStep ? (
                    <svg
                      className="w-4 h-4"
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
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 rounded ${
                      idx < currentStep ? 'bg-orange-400' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center">
            {steps[currentStep].description}
          </p>
        </div>
      </div>

      <div className="px-4 pb-8">
        {currentStep === 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
            <div className="flex justify-center mb-2">
              <div className="relative">
                {formData.avatar ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden">
                    <img
                      src={formData.avatar}
                      alt="头像"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <Avatar name={formData.name || '?'} size="xl" />
                )}
                <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const { compressImage } = await import('@/utils/image');
                        const compressed = await compressImage(file, 400, 0.8);
                        setFormData({ ...formData, avatar: compressed });
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入离职同事的姓名"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                昵称
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) =>
                  setFormData({ ...formData, nickname: e.target.value })
                }
                placeholder="大家平时怎么称呼TA"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm"
                maxLength={20}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  入职日期
                </label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) =>
                    setFormData({ ...formData, joinDate: e.target.value })
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
                  value={formData.leaveDate}
                  onChange={(e) =>
                    setFormData({ ...formData, leaveDate: e.target.value })
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
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="用一句话介绍一下TA..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent text-sm resize-none h-20"
                maxLength={100}
              />
            </div>

            <Button fullWidth size="lg" onClick={handleNext} disabled={!formData.name.trim()}>
              下一步
            </Button>
          </div>
        )}

        {currentStep === 1 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center animate-bounce-in">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              纪念册创建成功！
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              现在可以邀请团队成员一起添加祝福和回忆了
            </p>

            <div className="bg-orange-50 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <Avatar src={formData.avatar} name={formData.name} size="lg" />
                <div>
                  <h3 className="font-semibold text-gray-800">{formData.name}</h3>
                  {formData.nickname && (
                    <p className="text-sm text-gray-500">{formData.nickname}</p>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>入职：{formData.joinDate}</p>
                <p>离职：{formData.leaveDate}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button fullWidth size="lg" onClick={handleCreate}>
                进入纪念册
              </Button>
              <button
                onClick={handleUseSample}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                先看看示例
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
