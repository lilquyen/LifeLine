import { useEffect, useState } from 'react';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';
import React from 'react';
import { User, Phone, Shield, Tag, Camera, Check, X } from 'lucide-react'; // Sử dụng lucide-react để thêm icon

interface ProfileData {
  id: number;
  username: string;
  role: 'victim' | 'rescuer' | 'admin';
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
}

const normalizeProfile = (payload: ProfileData | { data: ProfileData }): ProfileData =>
  'data' in payload ? payload.data : payload;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    avatar_url: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/me');
      const data = normalizeProfile(res.data);
      setProfile(data);
      setForm({
        full_name: data?.full_name ?? '',
        phone: data?.phone ?? '',
        avatar_url: data?.avatar_url ?? ''
      });
    } catch (err: any) {
      setError('Không tải được thông tin hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/auth/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm((prev) => ({ ...prev, avatar_url: res.data?.url }));
      setSuccess('Tải ảnh thành công.');
    } catch (err: any) {
      setError('Không thể tải ảnh lên.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name,
        phone: form.phone || null,
        avatar_url: form.avatar_url || null
      };
      const res = await api.put('/auth/me', payload);
      const updated = normalizeProfile(res.data);
      setProfile(updated);
      updateUser({ ...user, ...updated, phone: updated.phone ?? undefined, avatar_url: updated.avatar_url ?? undefined });
      setSuccess('Cập nhật thành công!');
      setIsEditing(false);
    } catch (err: any) {
      setError('Cập nhật thất bại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12">Đang tải...</div>;
  if (!profile) return <div className="p-12 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-red-500 to-red-700"></div>

        <div className="relative px-6 pb-8">
          {/* Avatar Section - Đối xứng giữa Header */}
          <div className="relative -top-16 flex flex-col items-center sm:flex-row sm:items-end gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                {form.avatar_url ? (
                  <img src={form.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-red-400">
                    {profile.full_name.charAt(0)}
                  </div>
                )}
                {isEditing && (
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera size={24} />
                    <span className="text-[10px] mt-1">Thay đổi</span>
                    <input type="file" className="hidden" onChange={handleAvatarChange} />
                  </label>
                )}
              </div>
              {uploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full">...</div>}
            </div>

            <div className="text-center sm:text-left mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name || 'Người dùng'}</h1>
              <p className="text-gray-500 font-medium">@{profile.username}</p>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="sm:ml-auto mb-2 px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition"
              >
                Chỉnh sửa hồ sơ
              </button>
            )}
          </div>

          {/* Form / Info Section */}
          <div className="-mt-8">
            {(error || success) && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${error ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {error || success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cột 1 */}
              <div className="space-y-6">
                <InfoItem icon={<Tag size={18}/>} label="Họ và tên" isEditing={isEditing}>
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full bg-transparent font-medium focus:outline-none disabled:text-gray-700"
                    placeholder="Nhập họ tên..."
                  />
                </InfoItem>

                <InfoItem icon={<Phone size={18}/>} label="Số điện thoại" isEditing={isEditing}>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full bg-transparent font-medium focus:outline-none disabled:text-gray-700"
                    placeholder="Chưa có SĐT"
                  />
                </InfoItem>
              </div>

              {/* Cột 2 */}
              <div className="space-y-6">
                <InfoItem icon={<User size={18}/>} label="Tên đăng nhập" isEditing={false}>
                  <p className="font-medium text-gray-500">{profile.username}</p>
                </InfoItem>

                <InfoItem icon={<Shield size={18}/>} label="Vai trò hệ thống" isEditing={false}>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 uppercase">
                    {profile.role}
                  </span>
                </InfoItem>
              </div>

              {/* Buttons Row */}
              {isEditing && (
                <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); fetchProfile(); }}
                    className="px-6 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition disabled:opacity-50"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu cập nhật'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component phụ cho mỗi mục thông tin
function InfoItem({ icon, label, children, isEditing }: { icon: any, label: string, children: any, isEditing: boolean }) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${isEditing ? 'border-red-200 bg-red-50/30' : 'border-gray-100 bg-gray-50/50'}`}>
      <div className="flex items-center gap-3 mb-1 text-gray-400">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="pl-7 text-gray-800">
        {children}
      </div>
    </div>
  );
}