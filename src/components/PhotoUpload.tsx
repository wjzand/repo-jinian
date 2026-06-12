import React, { useRef, useState } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '@/utils/image';

interface PhotoUploadProps {
  value?: string;
  onChange?: (base64: string) => void;
  onRemove?: () => void;
  maxSize?: number;
  quality?: number;
  className?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  value,
  onChange,
  onRemove,
  maxSize = 800,
  quality = 0.7,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const compressed = await compressImage(file, maxSize, quality);
      onChange?.(compressed);
    } catch (error) {
      console.error('Failed to compress image:', error);
    } finally {
      setLoading(false);
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  if (value) {
    return (
      <div className={`relative group ${className}`}>
        <img
          src={value}
          alt="上传的照片"
          className="w-full h-full object-cover rounded-xl"
        />
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-orange-400 hover:bg-orange-50 transition-colors ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      {loading ? (
        <div className="animate-spin w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full" />
      ) : (
        <>
          <div className="flex gap-1 mb-2">
            <Camera className="w-5 h-5 text-gray-400" />
            <ImageIcon className="w-5 h-5 text-gray-400" />
          </div>
          <span className="text-sm text-gray-500">点击上传照片</span>
        </>
      )}
    </button>
  );
};
