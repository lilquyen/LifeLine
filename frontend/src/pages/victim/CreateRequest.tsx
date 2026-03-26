import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../services/api';

const URGENCY_LEVELS = [
  { value: 1, label: 'Mức 1 - Rất thấp',          color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 2, label: 'Mức 2 - Thấp',               color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 3, label: 'Mức 3 - Trung bình',          color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 4, label: 'Mức 4 - Cao',                 color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { value: 5, label: 'Mức 5 - Cực kỳ nguy hiểm',   color: 'bg-red-100 text-red-700 border-red-300' },
];

export default function CreateRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    urgency_level: 3,
    address: '',
    latitude: '',
    longitude: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Lấy vị trí hiện tại
  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị');
      return;
    }
    toast.loading('Đang lấy vị trí...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss();
        toast.success('Lấy vị trí thành công!');
        setForm(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString(),
        }));
      },
      () => {
        toast.dismiss();
        toast.error('Không lấy được vị trí');
      }
    );
  };

  // Chọn ảnh
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error('Tối đa 5 ảnh');
      return;
    }
    setImages(prev => [...prev, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  // Xóa ảnh
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.title) return toast.error('Vui lòng nhập tiêu đề');
    if (!form.latitude) return toast.error('Vui lòng lấy vị trí');

    setLoading(true);
    try {
        const formData = new FormData();
      
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('urgency_level', form.urgency_level.toString());
        formData.append('address', form.address);
        formData.append('lat', form.latitude);
        formData.append('lng', form.longitude);
      
       
        images.forEach((img) => {
          formData.append('images', img);
        });
      
        await api.post('/rescue-posts/post', formData);
      
        toast.success('Đăng yêu cầu thành công!');
        navigate('/victim/my-requests');
      
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Toaster position="top-right" />

      <div className="bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Tạo yêu cầu cứu hộ</h2>

        <div className="space-y-5">

          {/* Tiêu đề */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              placeholder="Mô tả ngắn gọn tình huống..."
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Mô tả chi tiết tình huống của bạn..."
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          {/* Mức độ nguy hiểm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ nguy hiểm</label>
            <div className="grid grid-cols-5 gap-2">
              {URGENCY_LEVELS.map(level => (
                <button
                  key={level.value}
                  onClick={() => setForm(prev => ({ ...prev, urgency_level: level.value }))}
                  className={`border rounded-lg py-2 text-xs font-medium transition ${
                    form.urgency_level === level.value
                      ? level.color + ' border-2'
                      : 'border-gray-200 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  Mức {level.value}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {URGENCY_LEVELS.find(l => l.value === form.urgency_level)?.label}
            </p>
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ mô tả</label>
            <input
              name="address"
              placeholder="Ví dụ: Gần chợ Bến Thành, Q1, TP.HCM"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          {/* Vị trí GPS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vị trí GPS <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <input
                value={form.latitude ? `${form.latitude}, ${form.longitude}` : ''}
                readOnly
                placeholder="Nhấn nút để lấy vị trí hiện tại"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm bg-gray-50"
              />
              <button
                onClick={getLocation}
                className="bg-blue-600 text-white px-4 py-3 rounded-lg text-sm hover:bg-blue-700 whitespace-nowrap"
              >
                 Lấy vị trí
              </button>
            </div>
          </div>

          {/* Upload ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hình ảnh (tối đa 5 ảnh)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center text-gray-500 hover:text-gray-700"
              >
                <span className="text-3xl mb-1"></span>
                <span className="text-sm">Nhấn để chọn ảnh</span>
              </label>

              {/* Preview ảnh */}
              {previews.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative">
                      <img src={src} className="w-full h-16 object-cover rounded-lg" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu cứu hộ'}
          </button>
        </div>
      </div>
    </div>
  );
}