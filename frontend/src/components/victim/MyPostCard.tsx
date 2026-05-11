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

const MyPostCard = ({ post }: { post: RescuePost }) => {
  // Hàm để đổi màu dựa trên mức độ khẩn cấp
  const getUrgencyStyle = (level: number) => {
    if (level >= 4) return 'bg-red-600 text-white';
    if (level >= 2) return 'bg-orange-500 text-white';
    return 'bg-blue-500 text-white';
  };

  return (
    <div className="bg-white border-l-4 border-red-600 shadow-md rounded-lg p-5 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
          {post.title}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getUrgencyStyle(post.urgency_level)}`}>
          CẤP ĐỘ {post.urgency_level}
        </span>
      </div>

      <p className="text-gray-600 mb-3 line-clamp-2">{post.description}</p>
      
      <div className="flex items-center text-sm text-gray-500 mb-3">
        <span className="mr-2">📍</span>
        <span className="italic">{post.address}</span>
      </div>

      <div className="flex justify-between items-center border-t pt-3">
        <span className="text-xs text-gray-400">
          Ngày đăng: {new Date(post.created_at).toLocaleDateString('vi-VN')}
        </span>
        <span className={`font-semibold text-sm ${post.status === 'pending' ? 'text-orange-500' : 'text-green-600'}`}>
          ● {post.status.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default MyPostCard;