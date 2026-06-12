import React from 'react';
import { Calendar, Trash2, Edit3, Sparkles } from 'lucide-react';
import type { Moment } from '@/types';
import { MOMENT_TYPE_OPTIONS } from '@/types';
import { formatDateCN } from '@/utils/date';
import { cn } from '@/lib/utils';

interface MomentCardProps {
  moment: Moment;
  isLeft?: boolean;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function getTypeInfo(type: string) {
  return MOMENT_TYPE_OPTIONS.find((t) => t.value === type) || MOMENT_TYPE_OPTIONS[6];
}

export const MomentCard: React.FC<MomentCardProps> = ({
  moment,
  isLeft = true,
  isAdmin = false,
  onEdit,
  onDelete,
  onClick,
  className = '',
  style,
}) => {
  const typeInfo = getTypeInfo(moment.type);

  return (
    <div
      className={cn(
        'relative pl-4 pb-8',
        className
      )}
      style={style}
    >
      <div className="absolute left-0 top-0 w-3 h-3 -ml-1.5 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 border-2 border-white shadow-md" />

      <div
        onClick={onClick}
        className="bg-white rounded-2xl p-4 shadow-card hover:shadow-md transition-shadow cursor-pointer animate-slide-up"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{typeInfo.emoji}</span>
            <span className="text-xs font-medium px-2 py-0.5 bg-orange-50 text-orange-500 rounded-full">
              {typeInfo.label}
            </span>
            {moment.isSystemGenerated && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                系统生成
              </span>
            )}
          </div>
          {isAdmin && !moment.isSystemGenerated && (
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <h4 className="font-semibold text-gray-800 mb-1">{moment.title}</h4>

        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
          <Calendar className="w-3 h-3" />
          <span>{formatDateCN(moment.date)}</span>
        </div>

        {moment.photos && moment.photos.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {moment.photos.slice(0, 3).map((photo, idx) => (
              <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={photo}
                  alt={`${moment.title}-${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {moment.photos.length > 3 && (
              <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
                +{moment.photos.length - 3}
              </div>
            )}
          </div>
        )}

        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {moment.description}
        </p>
      </div>
    </div>
  );
};
