import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

export default function VictimLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl"></span>
          <span className="font-bold text-red-600 text-xl">LifeLine</span>
        </div>

        <div className="flex items-center gap-6">
          <NavLink
            to="/victim/dashboard"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`
            }
          >
            Trang chủ
          </NavLink>
          <NavLink
            to="/victim/create-request"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`
            }
          >
            Tạo yêu cầu
          </NavLink>
          <NavLink
            to="/victim/my-requests"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`
            }
          >
            Yêu cầu của tôi
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">👤 {user?.full_name}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}