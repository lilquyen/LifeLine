import React, { useState } from 'react';
import { updateLocation } from '../../services/rescuerApi';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationUpdaterProps {
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export const LocationUpdater: React.FC<LocationUpdaterProps> = ({ onLocationUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        try {
          await updateLocation(latitude, longitude);
          onLocationUpdate?.(latitude, longitude);
          alert('Cập nhật vị trí thành công');
        } catch (error) {
          console.error(error);
          alert('Cập nhật thất bại');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        alert('Không thể lấy vị trí hiện tại');
        setLoading(false);
      }
    );
  };

  return (
    <button
      onClick={handleGetLocation}
      disabled={loading}
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
      {loading ? 'Đang cập nhật...' : 'Cập nhật vị trí của tôi'}
    </button>
  );
};