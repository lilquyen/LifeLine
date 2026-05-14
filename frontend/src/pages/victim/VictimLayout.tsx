import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import NotificationBell from '../../components/NotificationBell';

export default function VictimLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header của Victim */}
      <header className="h-16 flex-none bg-white border-b">
        <div className="px-6 py-4 flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚑</span>
            <span className="font-bold text-red-600 text-xl">LifeLine</span>
          </div>

          <div className="flex items-center gap-6">
            <NavLink
              to="/victim/dashboard"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`
              }
            >
              Dashboard
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
              to="/victim/my-posts"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`
              }
            >
              Yêu cầu của tôi
            </NavLink>
            <NavLink
              to="/victim/conversations"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`
              }
            >
              Nhắn tin
            </NavLink>
            <NavLink
              to="/victim/profile"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`
              }
            >
              Hồ sơ
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">👤 {user?.full_name}</span>
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main content với flex-1 và overflow-hidden */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
