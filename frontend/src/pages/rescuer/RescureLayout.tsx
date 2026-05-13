import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom'; // Đổi từ Link sang NavLink
import { MessageSquare, Map, Bell, Users, LogOut, ShieldAlert } from 'lucide-react';

export default function RescureLayout() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-200 overflow-hidden font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950">
          <ShieldAlert className="text-red-500" size={28} />
          <span className="text-lg font-bold tracking-wider">LINELIFE CMD</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink 
          to="/rescuer/dashboard" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
              isActive 
                ? 'bg-red-600 text-white shadow-md shadow-red-900/20' 
                : 'text-gray-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <Map size={20} />
          Bản đồ Cứu hộ
        </NavLink>

        <NavLink 
          to="/rescuer/assignments" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive 
                ? 'bg-red-600 text-white shadow-md shadow-red-900/20' 
                : 'text-gray-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <Users size={20} />
          Các ca cứu hộ
        </NavLink>

        <NavLink 
          to="/rescuer/conversations" 
          className={({ isActive }) => 
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive 
                ? 'bg-red-600 text-white shadow-md shadow-red-900/20' 
                : 'text-gray-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <MessageSquare size={20} />
          Nhắn tin
        </NavLink>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors">
            <LogOut size={20} /> Đăng xuất
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col relative">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
          <h2 className="text-xl font-semibold text-slate-800">Tổng đài Tình nguyện viên</h2>
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-5">
              <div className="w-9 h-9 bg-slate-800 text-white flex items-center justify-center rounded-full font-bold shadow">TN</div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}