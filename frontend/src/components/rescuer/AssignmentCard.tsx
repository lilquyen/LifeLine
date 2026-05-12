import React from 'react';
import { MessageCircle, MapPin, Calendar } from 'lucide-react';

interface AssignmentCardProps {
  assignment: {
    assignment_id: number;
    request_id: number;
    request_title: string;
    request_description: string;
    urgency_level: number;
    address: string;
    assignment_status: string;
    assigned_at: string;
  };
  onMessage: (requestId: number) => void;
  onViewDetail: (requestId: number) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onMessage, onViewDetail }) => {
  const statusColor = assignment.assignment_status === 'accepted' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
  const statusText = assignment.assignment_status === 'accepted' ? 'Đã nhận' : 'Đã hủy';

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition bg-white">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-md">{assignment.request_title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>{statusText}</span>
      </div>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{assignment.request_description || 'Không có mô tả'}</p>
      <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
        <MapPin size={14} />
        <span>{assignment.address}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
        <Calendar size={14} />
        <span>Nhận lúc: {new Date(assignment.assigned_at).toLocaleString('vi-VN')}</span>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onViewDetail(assignment.request_id)}
          className="text-sm text-blue-600 hover:underline"
        >
          Xem chi tiết
        </button>
        <button
          onClick={() => onMessage(assignment.request_id)}
          className="flex items-center gap-1 text-sm text-red-600 hover:underline"
        >
          <MessageCircle size={14} /> Nhắn tin
        </button>
      </div>
    </div>
  );
};