import React, { useState } from 'react';
import { X, MapPin, Loader2 } from 'lucide-react';

interface AcceptConfirmationModalProps {
  requestId: number;
  requestTitle: string;
  onClose: () => void;
  onConfirm: (lat: number, lng: number) => Promise<void>;
}

export const AcceptConfirmationModal: React.FC<AcceptConfirmationModalProps> = ({
  requestId,
  requestTitle,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  const handleUpdateLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị');
      return;
    }
    setUpdatingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setUpdatingLocation(false);
        alert('Đã cập nhật vị trí thành công');
      },
      (err) => {
        console.error(err);
        alert('Không thể lấy vị trí hiện tại');
        setUpdatingLocation(false);
      }
    );
  };

  const handleConfirm = async () => {
    if (!location) {
      alert('Vui lòng cập nhật vị trí trước khi nhận ca');
      return;
    }
    setLoading(true);
    try {
      await onConfirm(location.lat, location.lng);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Nhận ca thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold">Xác nhận nhận cứu hộ</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <p className="text-gray-700">
            Bạn sắp nhận ca: <span className="font-semibold">{requestTitle}</span>
          </p>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} />
                <span>{location ? 'Đã cập nhật vị trí' : 'Chưa cập nhật vị trí'}</span>
              </div>
              <button
                onClick={handleUpdateLocation}
                disabled={updatingLocation}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {updatingLocation ? <Loader2 size={16} className="animate-spin" /> : 'Cập nhật'}
              </button>
            </div>
            {location && (
              <p className="text-xs text-gray-400 mt-2">
                Tọa độ: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!location || loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Xác nhận nhận ca'}
          </button>
        </div>
      </div>
    </div>
  );
};