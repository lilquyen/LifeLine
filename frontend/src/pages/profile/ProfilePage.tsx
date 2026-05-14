import { useEffect, useState } from 'react';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

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
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/auth/me');
        const data = normalizeProfile(res.data);
        setProfile(data);
        setForm({
          full_name: data?.full_name ?? '',
          phone: data?.phone ?? '',
          avatar_url: data?.avatar_url ?? ''
        });
        setIsEditing(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không tải được thông tin hồ sơ.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      avatar_url: profile?.avatar_url ?? ''
    });
  };

  const handleStartEdit = () => {
    setError('');
    setSuccess('');
    setIsEditing(true);
    resetForm();
  };

  const handleCancel = () => {
    setError('');
    setSuccess('');
    setIsEditing(false);
    resetForm();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/auth/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const avatarUrl = res.data?.url;
      if (!avatarUrl) {
        throw new Error('Upload failed');
      }
      setForm((prev) => ({ ...prev, avatar_url: avatarUrl }));
      setSuccess('Tải ảnh thành công.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải ảnh lên.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        full_name: form.full_name,
        phone: form.phone,
        avatar_url: form.avatar_url || null
      };

      const res = await api.put('/auth/me', payload);
      const updated = normalizeProfile(res.data);
      setProfile(updated);
      setForm({
        full_name: updated?.full_name ?? '',
        phone: updated?.phone ?? '',
        avatar_url: updated?.avatar_url ?? ''
      });

      if (user) {
        updateUser({
          ...user,
          full_name: updated.full_name,
          phone: updated.phone ?? undefined,
          avatar_url: updated.avatar_url ?? undefined
        });
      }

      setSuccess('Cập nhật hồ sơ thành công.');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Cập nhật hồ sơ thất bại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Đang tải hồ sơ...</div>;
  }

  if (!profile) {
    return <div className="p-6 text-red-600">{error || 'Không có dữ liệu hồ sơ.'}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Hồ sơ cá nhân</h1>
            <p className="text-sm text-gray-500">Thông tin tài khoản của bạn</p>
          </div>
          {!isEditing && (
            <button
              onClick={handleStartEdit}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition"
            >
              Cập nhật thông tin
            </button>
          )}
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3">{error}</div>}
        {success && <div className="mb-4 rounded-lg bg-green-50 text-green-700 px-4 py-3">{success}</div>}

        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
          {form.avatar_url ? (
            <img
              src={form.avatar_url}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
              No Avatar
            </div>
          )}

          {isEditing && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="block text-sm text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                {uploading ? 'Đang tải ảnh lên...' : 'Chọn ảnh để cập nhật avatar'}
              </p>
            </div>
          )}
        </div>

        {isEditing ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
              <input
                value={profile.username}
                disabled
                className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
              <input
                value={profile.role}
                disabled
                className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
              <input
                name="avatar_url"
                value={form.avatar_url}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving || uploading}
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="border border-gray-300 text-gray-700 font-medium px-5 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Huỷ
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="text-xs text-gray-500">Tên đăng nhập</p>
              <p className="font-medium">{profile.username}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Vai trò</p>
              <p className="font-medium">{profile.role}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Họ và tên</p>
              <p className="font-medium">{profile.full_name || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Số điện thoại</p>
              <p className="font-medium">{profile.phone || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Avatar URL</p>
              <p className="font-medium break-all">{profile.avatar_url || 'Chưa cập nhật'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
