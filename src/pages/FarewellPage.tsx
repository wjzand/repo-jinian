import React, { useState } from 'react';
import { Download, Share2, Image, FileJson, FileCode } from 'lucide-react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { EmptyState } from '@/components/EmptyState';
import { useBookStore } from '@/store/useBookStore';
import { generateLongImage, downloadImage, shareImage } from '@/utils/canvas';

export const FarewellPage: React.FC = () => {
  const { currentBook, messages, moments, isAdmin } = useBookStore();
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleGenerate = async () => {
    if (!currentBook) return;

    setGenerating(true);
    setProgress(0);

    try {
      const image = await generateLongImage({
        book: currentBook,
        messages,
        moments,
        onProgress: (p) => setProgress(p),
      });
      setGeneratedImage(image);
      setShowPreview(true);
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage && currentBook) {
      downloadImage(generatedImage, `${currentBook.name}-离职纪念册.jpg`);
    }
  };

  const handleShare = async () => {
    if (generatedImage && currentBook) {
      const success = await shareImage(generatedImage, currentBook.name);
      if (!success) {
        handleDownload();
      }
    }
  };

  const handleExportJson = () => {
    if (!currentBook) return;

    const data = {
      book: currentBook,
      messages,
      moments,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${currentBook.name}-纪念册数据.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const handleExportHtml = () => {
    if (!currentBook) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentBook.name} - 离职纪念册</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
      background: linear-gradient(180deg, #FFF8F3 0%, #FFEFE0 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 600px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #FF8A5B, #FF6B6B);
      border-radius: 20px;
      padding: 40px 20px;
      text-align: center;
      color: white;
      margin-bottom: 20px;
    }
    .header h1 { font-size: 32px; margin-bottom: 10px; }
    .section {
      background: white;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .section h2 {
      font-size: 20px;
      margin-bottom: 16px;
      color: #333;
    }
    .message-card {
      padding: 12px;
      background: #FFF8F3;
      border-radius: 12px;
      margin-bottom: 10px;
    }
    .moment-item {
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .moment-item:last-child { border-bottom: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${currentBook.name}</h1>
      <p>${currentBook.bio || ''}</p>
    </div>
    <div class="section">
      <h2>💌 留言墙 (${messages.filter(m => m.isApproved).length}条)</h2>
      ${messages.filter(m => m.isApproved).map(m => `
        <div class="message-card">
          <strong>${m.isAnonymous ? '匿名同事' : m.authorName}</strong>
          <p>${m.content}</p>
        </div>
      `).join('')}
    </div>
    <div class="section">
      <h2>📅 时光轴 (${moments.length}个时刻)</h2>
      ${moments.map(m => `
        <div class="moment-item">
          <strong>${m.title}</strong>
          <p>${m.date}</p>
          <p>${m.description}</p>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>
    `.trim();

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${currentBook.name}-离职纪念册.html`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  if (!currentBook) return null;

  return (
    <div className="min-h-screen pb-24">
      <div className="safe-area-top bg-gradient-to-b from-pink-50 to-transparent sticky top-0 z-30">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 mb-1">告别信</h1>
          <p className="text-sm text-gray-500">生成专属的离职纪念长图</p>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl p-6 shadow-card text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-rose-100 rounded-full flex items-center justify-center">
            <Image className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">生成告别长图</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            自动收集所有祝福和回忆，生成一张精美的长图，保存或分享给大家
          </p>

          {generating ? (
            <div className="space-y-3">
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-rose-400 transition-all duration-300"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">正在生成中... {Math.round(progress * 100)}%</p>
            </div>
          ) : (
            <Button fullWidth size="lg" onClick={handleGenerate}>
              <Image className="w-5 h-5" />
              生成纪念长图
            </Button>
          )}
        </div>

        {isAdmin && (
          <div className="bg-white rounded-2xl p-6 shadow-card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">数据导出</h3>
            <p className="text-sm text-gray-500 mb-4">
              导出纪念册的全部数据，作为永久保存
            </p>
            <div className="space-y-3">
              <button
                onClick={handleExportJson}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileJson className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-800">JSON 格式</div>
                  <div className="text-xs text-gray-500">完整数据，可重新导入</div>
                </div>
              </button>
              <button
                onClick={handleExportHtml}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FileCode className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-800">HTML 网页</div>
                  <div className="text-xs text-gray-500">浏览器直接打开查看</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {generatedImage && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-3">上次生成的长图</p>
            <button
              onClick={() => setShowPreview(true)}
              className="inline-block rounded-xl overflow-hidden shadow-card"
            >
              <img
                src={generatedImage}
                alt="纪念长图预览"
                className="w-40 h-auto"
              />
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="纪念长图预览"
      >
        <div className="p-4">
          <div className="max-h-[60vh] overflow-y-auto mb-4 -mx-4 px-4">
            <img
              src={generatedImage}
              alt="纪念长图"
              className="w-full h-auto rounded-xl shadow-lg"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={handleDownload}>
              <Download className="w-4 h-4" />
              保存图片
            </Button>
            <Button fullWidth onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              分享
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="导出数据"
      >
        <div className="p-6 space-y-4">
          <button
            onClick={handleExportJson}
            className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <FileJson className="w-6 h-6 text-blue-500" />
            <div className="text-left">
              <div className="font-medium text-gray-800">导出 JSON</div>
              <div className="text-xs text-gray-500">完整数据格式</div>
            </div>
          </button>
          <button
            onClick={handleExportHtml}
            className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <FileCode className="w-6 h-6 text-emerald-500" />
            <div className="text-left">
              <div className="font-medium text-gray-800">导出 HTML</div>
              <div className="text-xs text-gray-500">网页格式，直接查看</div>
            </div>
          </button>
        </div>
      </Modal>
    </div>
  );
};
