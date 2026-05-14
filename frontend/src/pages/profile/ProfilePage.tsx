import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import useAuthStore from '../../stores/authStore';

interface ProfileData {
  id: number;
  username: string;
  role: 'victim' | 'rescuer' | 'admin';
  full_name: string;
  phone: string;
  avatar_url?: string | null;
}

const normalizeProfile = (payload: any): ProfileData => payload?.data ?? payload;

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
          full_name: data?.full_name || '',
          phone: data?.phone || '',
          avatar_url: data?.avatar_url || ''
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        full_name: form.full_name,
        phone: form.phone,
        avatar_url: form.avatar_url
      };

      const res = await api.put('/auth/me', payload);
      const updated = normalizeProfile(res.data);
      setProfile(updated);
      setForm({
        full_name: updated?.full_name || '',
        phone: updated?.phone || '',
        avatar_url: updated?.avatar_url || ''
      });

      if (user) {
        updateUser({
          ...user,
          full_name: updated.full_name,
          phone: updated.phone,
          avatar_url: updated.avatar_url || undefined
        });
      }

      setSuccess('Cập nhật hồ sơ thành công.');
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
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Hồ sơ cá nhân</h1>

        {error && <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3">{error}</div>}
        {success && <div className="mb-4 rounded-lg bg-green-50 text-green-700 px-4 py-3">{success}</div>}

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

          <button
            type="submit"
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}
