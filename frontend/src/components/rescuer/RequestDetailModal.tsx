import React, { useEffect, useState } from 'react';
import { X, MapPin, Calendar, ImageIcon, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchRequestDetail } from '../../services/rescuerApi';

// Icon mặc định
const defaultIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface RequestDetailModalProps {
  requestId: number | null;
  onClose: () => void;
  onAccept: (requestId: number) => void; // Thay vì onAssignSuccess, gọi ra ngoài để mở modal xác nhận
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({ requestId, onClose, onAccept }) => {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchRequestDetail(requestId);
        setDetail(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [requestId]);

  const handleAccept = () => {
    if (requestId) {
      onAccept(requestId);
      onClose(); // đóng modal chi tiết
    }
  };

  if (!requestId) return null;

  const urgencyColor = (level: number) => {
    if (level >= 4) return 'text-red-600 bg-red-100';
    if (level >= 3) return 'text-orange-600 bg-orange-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[1px] flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative z-[10000]">
        <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Chi tiết yêu cầu cứu hộ</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center">Đang tải...</div>
          ) : detail ? (
            <div className="p-4">
              {/* Layout 2 cột: trái bản đồ, phải thông tin */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cột trái: Bản đồ */}
                <div className="h-80 md:h-96 rounded-lg overflow-hidden border">
                  {detail.lat && detail.lng ? (
                    <MapContainer
                      center={[detail.lat, detail.lng]}
                      zoom={14}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[detail.lat, detail.lng]} icon={defaultIcon}>
                        <Popup>{detail.title}</Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">Không có tọa độ</div>
                  )}
                </div>

                {/* Cột phải: Thông tin */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold">{detail.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${urgencyColor(detail.urgency_level)}`}>
                      Cấp độ {detail.urgency_level}
                    </span>
                  </div>
                  <p className="text-gray-700">{detail.description || 'Không có mô tả'}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={16} />
                    <span>{detail.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    <span>{new Date(detail.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                  {detail.image_urls && detail.image_urls.length > 0 && (
                    <div>
                      <div className="font-medium mb-2 flex items-center gap-1"><ImageIcon size={16} /> Hình ảnh kèm theo</div>
                      <div className="grid grid-cols-3 gap-2">
                        {detail.image_urls.map((url: string, idx: number) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`hinh-${idx}`}
                            className="rounded-lg object-cover w-full h-24 cursor-pointer hover:opacity-80"
                            onClick={() => window.open(url)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Nút nhận cứu hộ ở dưới cùng */}
              <div className="pt-6 mt-6 border-t flex justify-end">
                <button
                  onClick={handleAccept}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Nhận cứu hộ
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-red-500">Không tìm thấy thông tin</div>
          )}
        </div>
        </div>
    </div>
  );
};