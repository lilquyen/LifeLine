import React from 'react';

interface PendingRequest {
  id: number;
  title: string;
  urgency_level: number;
  address: string;
  created_at: string;
}

interface PendingRequestsListProps {
  requests: PendingRequest[];
  onSelect: (id: number) => void;        // click vào thẻ -> mở modal chi tiết
  onAccept: (id: number) => void;        // click nút "Nhận cứu hộ" -> mở modal xác nhận
}

export const PendingRequestsList: React.FC<PendingRequestsListProps> = ({ requests, onSelect, onAccept }) => {
  const getUrgencyClass = (level: number) => {
    if (level >= 4) return 'border-l-4 border-red-500 bg-red-50';
    if (level >= 3) return 'border-l-4 border-orange-500 bg-orange-50';
    return 'border-l-4 border-yellow-500 bg-yellow-50';
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      {requests.length === 0 ? (
        <div className="text-center text-gray-400 py-10">Hiện không có ca cứu hộ nào chờ xử lý</div>
      ) : (
        requests.map((req) => (
          <div
            key={req.id}
            className={`p-3 rounded-lg cursor-pointer transition hover:shadow-md ${getUrgencyClass(req.urgency_level)}`}
          >
            {/* Phần nội dung có thể click để xem chi tiết */}
            <div onClick={() => onSelect(req.id)} className="cursor-pointer">
              <div className="font-bold text-sm">{req.title}</div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-1">{req.address}</div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">Cấp {req.urgency_level}</span>
                <span className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            {/* Nút nhận cứu hộ */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAccept(req.id);
              }}
              className="mt-2 w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
            >
              Nhận cứu hộ
            </button>
          </div>
        ))
      )}
    </div>
  );
};