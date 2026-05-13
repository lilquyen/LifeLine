import React, { useState } from 'react';
import { MapPin, Calendar, MessageCircle, X, Loader2, Eye, XCircle } from 'lucide-react';
import { updateLocation, cancelAssignment, failAssignment, updateLocationHistory } from '../../services/rescuerApi';

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
  onAssignmentUpdate?: () => void; // Callback để refresh danh sách sau khi cập nhật
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({ 
  assignment, 
  onMessage, 
  onViewDetail,
  onAssignmentUpdate 
}) => {
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const statusColor = assignment.assignment_status === 'accepted' 
    ? 'text-green-600 bg-green-100' 
    : assignment.assignment_status === 'cancelled'
    ? 'text-red-600 bg-red-100'
    : 'text-gray-600 bg-gray-100';
    
  const statusText = assignment.assignment_status === 'accepted' 
    ? 'Đã nhận' 
    : assignment.assignment_status === 'cancelled'
    ? 'Đã hủy'
    : 'Đã hoàn thành';

  // Cập nhật vị trí
  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị');
      return;
    }
    
    setUpdatingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          await updateLocationHistory(assignment.request_id, lat, lng);
          await updateLocation(lat, lng);
          alert('Cập nhật vị trí thành công');
          onAssignmentUpdate?.();
        } catch (error) {
          console.error(error);
          alert('Cập nhật thất bại');
        } finally {
          setUpdatingLocation(false);
        }
      },
      (err) => {
        console.error(err);
        alert('Không thể lấy vị trí hiện tại');
        setUpdatingLocation(false);
      }
    );
  };

  // Hủy ca cứu hộ
  const handleCancelAssignment = async () => {
    if (!cancelMessage.trim()) {
      alert('Vui lòng nhập lý do hủy');
      return;
    }
    
    setCancelling(true);
    try {
      // Gửi tin nhắn hủy
      await cancelAssignment(assignment.request_id, cancelMessage);
      // Đánh dấu assignment thất bại
      await failAssignment(assignment.request_id);
      
      alert('Đã hủy ca cứu hộ');
      setShowCancelModal(false);
      setCancelMessage('');
      onAssignmentUpdate?.();
    } catch (error) {
      console.error(error);
      alert('Hủy ca thất bại');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
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
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          {/* Nút Xem chi tiết - Màu Xanh dương nhẹ */}
          <button
            onClick={() => onViewDetail(assignment.request_id)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors border border-blue-100"
          >
            <Eye size={16} />
            Xem chi tiết
          </button>

          {/* Nút Nhắn tin - Màu Đỏ đặc trưng của hệ thống */}
          <button
            onClick={() => onMessage(assignment.request_id)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors border border-red-100"
          >
            <MessageCircle size={16} />
            Nhắn tin
          </button>

          {assignment.assignment_status === 'accepted' ? (
            // Chỉ hiện nút Cập nhật vị trí và Hủy ca khi đang trong trạng thái 'accepted'
            <>
              <button
                onClick={handleUpdateLocation}
                disabled={updatingLocation}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors border border-green-100"
              >
                {updatingLocation ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                Vị trí
              </button>
              
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-semibold hover:bg-red-50 hover:text-red-600 transition-all border border-gray-200 hover:border-red-200"
              >
                <XCircle size={16} />
                Hủy ca
              </button>
            </>
          ) : assignment.assignment_status === 'cancelled' ? (
            /* Hiện trạng thái Đã hủy chiếm hết 2 cột còn lại của Grid */
            <div className="col-span-2 px-3 py-2 rounded-lg border border-red-100 bg-red-50 flex items-center justify-center text-[10px] text-red-500 font-bold uppercase">
              Ca cứu hộ này đã bị hủy
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal xác nhận hủy */}
      {showCancelModal && (
        <div className="fixed inset-0 backdrop-blur-[1px] bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">Xác nhận hủy ca cứu hộ</h3>
              <button 
                onClick={() => setShowCancelModal(false)} 
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <p className="text-gray-700">
                Bạn đang hủy ca: <span className="font-semibold">{assignment.request_title}</span>
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do hủy
                </label>
                <textarea
                  value={cancelMessage}
                  onChange={(e) => setCancelMessage(e.target.value)}
                  placeholder="Nhập lý do hủy ca cứu hộ..."
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-2 p-4 border-t">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleCancelAssignment}
                disabled={cancelling || !cancelMessage.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {cancelling ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};