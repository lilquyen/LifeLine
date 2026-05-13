// src/components/victim/MyPostCard.tsx
import React from 'react';

interface RescuePost {
  id: number;
  title: string;
  description: string;
  urgency_level: number;
  address: string;
  status: string;
  created_at: string;
}

interface Props {
  post: RescuePost;
  onCancel: (id: number) => void;
  onComplete: (id: number) => void;
  onUpdate: (post: RescuePost) => void;
}

const MyPostCard = ({ post, onCancel, onComplete, onUpdate }: Props) => {
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { color: 'text-orange-500', bg: 'border-orange-500', label: 'ĐANG CHỜ' };
      case 'assigned': return { color: 'text-blue-500', bg: 'border-blue-500', label: 'ĐÃ TIẾP NHẬN' };
      case 'completed': return { color: 'text-green-600', bg: 'border-green-600', label: 'HOÀN THÀNH' };
      case 'cancelled': return { color: 'text-gray-400', bg: 'border-gray-300', label: 'ĐÃ HỦY' };
      default: return { color: 'text-gray-500', bg: 'border-gray-200', label: status.toUpperCase() };
    }
  };

  const config = getStatusConfig(post.status);
  const isCancelled = post.status === 'cancelled';
  const isCompleted = post.status === 'completed';

  return (
    <div className={`bg-white border-l-4 ${config.bg} shadow-md rounded-lg p-5 mb-4 hover:shadow-lg transition-all`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-gray-800 uppercase line-clamp-1">{post.title}</h3>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${config.color} border-current`}>
          {config.label}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.description}</p>
      
      <div className="flex items-center text-xs text-gray-500 mb-4 italic">
        <span className="mr-1">📍</span> {post.address}
      </div>

      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
        {!isCancelled && !isCompleted && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdate(post); }}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded text-xs font-bold hover:bg-blue-100"
            >
              CẬP NHẬT
            </button>
            {post.status === 'assigned' && (
              <button 
                onClick={(e) => { e.stopPropagation(); onComplete(post.id); }}
                className="px-3 py-1.5 bg-green-50 text-green-600 rounded text-xs font-bold hover:bg-green-100 transition-colors"
              >
                HOÀN THÀNH
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onCancel(post.id); }}
              className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-xs font-bold hover:bg-red-100"
            >
              HỦY
            </button>
          </>
        )}
        {isCancelled && <span className="text-xs text-gray-400 italic">Yêu cầu này đã bị hủy</span>}
      </div>
    </div>
  );
};

export default MyPostCard;