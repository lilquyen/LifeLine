import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';
import api from '../../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    phone: '',
    full_name: '',
    role: 'victim'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', {
          username: form.username,
          password: form.password
        });
        login(res.data.user, res.data.token);
        toast.success('Đăng nhập thành công!');

        if (res.data.user.role === 'victim')  navigate('/victim/create-request');
        if (res.data.user.role === 'rescuer') navigate('/rescuer/dashboard');
        if (res.data.user.role === 'admin')   navigate('/admin/');
      } else {
        await api.post('/auth/register', form);
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />

      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🆘</div>
          <h1 className="text-3xl font-bold text-red-600">LifeLine</h1>
          <p className="text-gray-500 text-sm mt-1">Hỗ trợ cứu nạn khẩn cấp</p>
        </div>

        {/* Tab Login / Register */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              isLogin ? 'bg-white shadow text-red-600' : 'text-gray-500'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              !isLogin ? 'bg-white shadow text-red-600' : 'text-gray-500'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {!isLogin && (
            <>
              <input
                name="full_name"
                placeholder="Họ và tên"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <input
                name="phone"
                placeholder="Số điện thoại"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <select
                name="role"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="victim">Người cần cứu hộ</option>
                <option value="rescuer">Người cứu hộ</option>
              </select>
            </>
          )}

          <input
            name="username"
            placeholder="Tên đăng nhập"
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <input
            name="password"
            type="password"
            placeholder="Mật khẩu"
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </div>
      </div>
    </div>
  );
}