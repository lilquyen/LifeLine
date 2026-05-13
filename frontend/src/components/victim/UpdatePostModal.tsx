// src/components/victim/UpdatePostModal.tsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface UpdateModalProps {
  post: any;
  onClose: () => void;
  onConfirm: (data: any) => Promise<void>;
}

const UpdatePostModal = ({ post, onClose, onConfirm }: UpdateModalProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    urgency_level: '',
    address: '',
    lat: '',
    lng: ''
  });

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(prev => ({ ...prev, lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString() }));
        toast.success("Đã cập nhật tọa độ mới!");
      },
      () => toast.error("Không thể lấy vị trí")
    );
  };

  const handleUpdate = async () => {
    // Kiểm tra có ít nhất 1 trường được điền
    const hasData = Object.values(form).some(val => val !== '');
    if (!hasData) return toast.error("Vui lòng nhập ít nhất một thông tin cần thay đổi");

    setLoading(true);
    // Chỉ gửi những field có dữ liệu
    const updatePayload = Object.fromEntries(Object.entries(form).filter(([_, v]) => v !== ''));
    await onConfirm(updatePayload);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Cập nhật yêu cầu #{post.id}</h2>
        
        <div className="space-y-4">
          <input 
            placeholder="Tiêu đề mới (không bắt buộc)" 
            className="w-full border p-2 rounded"
            onChange={e => setForm({...form, title: e.target.value})}
          />
          <textarea 
            placeholder="Mô tả mới..." 
            className="w-full border p-2 rounded"
            onChange={e => setForm({...form, description: e.target.value})}
          />
          <select 
            className="w-full border p-2 rounded"
            onChange={e => setForm({...form, urgency_level: e.target.value})}
          >
            <option value="">Chọn mức độ khẩn cấp (Giữ nguyên)</option>
            {[1,2,3,4,5].map(v => <option key={v} value={v}>Mức {v}</option>)}
          </select>
          <input 
            placeholder="Địa chỉ mô tả mới..." 
            className="w-full border p-2 rounded"
            onChange={e => setForm({...form, address: e.target.value})}
          />
          <button 
            onClick={getLocation}
            className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
          >
            📍 Cập nhật vị trí GPS hiện tại {form.lat && '(Đã có tọa độ)'}
          </button>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 bg-gray-100 rounded font-bold">HỦY</button>
          <button 
            onClick={handleUpdate} 
            disabled={loading}
            className="flex-1 py-2 bg-red-600 text-white rounded font-bold disabled:opacity-50"
          >
            {loading ? 'ĐANG LƯU...' : 'CẬP NHẬT'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePostModal;