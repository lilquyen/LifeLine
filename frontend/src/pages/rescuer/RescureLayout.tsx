import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Map, Bell, Users, LogOut, ShieldAlert } from 'lucide-react'; // Lấy icon từ thư viện có sẵn của bạn
// import useAuthStore from '../../stores/authStore'; // Mở comment dòng này nếu bạn muốn dùng store để đăng xuất

export default function RescureLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Tạm thời xóa token trong localStorage để test
    localStorage.removeItem('token'); 
    // Nếu dùng authStore: useAuthStore.getState().logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-200 overflow-hidden font-sans">
      
      {/* --- CỘT TRÁI: MENUBAR (SIDEBAR) --- */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950">
          <ShieldAlert className="text-red-500" size={28} />
          <span className="text-lg font-bold tracking-wider">LINELIFE CMD</span>
        </div>
        
        {/* Danh sách Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            to="/rescuer/dashboard" 
            className="flex items-center gap-3 px-4 py-3 bg-red-600 rounded-lg text-white font-medium shadow-md shadow-red-900/20"
          >
            <Map size={20} />
            Bản đồ Cứu hộ
          </Link>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Users size={20} />
            Đội ngũ
          </button>
        </nav>

        {/* Nút Đăng xuất ở đáy */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* --- PHẦN BÊN PHẢI: HEADER VÀ NỘI DUNG --- */}
      <div className="flex-1 flex flex-col relative">
        
        {/* HEADER (Thanh ngang trên cùng) */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
          <h2 className="text-xl font-semibold text-slate-800">
            Tổng đài Điều phối Tình nguyện viên
          </h2>
          
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition">
              <Bell size={22} />
              {/* Dấu chấm đỏ báo có thông báo mới */}
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-5">
              <div className="w-9 h-9 bg-slate-800 text-white flex items-center justify-center rounded-full font-bold shadow">
                TN
              </div>
            </div>
          </div>
        </header>

        {/* --- CÁI LỖ HỔNG QUAN TRỌNG NHẤT --- */}
        {/* Đây chính là nơi React sẽ tự động nhét file RescuerDashboard.tsx vào */}
        <main className="flex-1 overflow-auto relative">
          <Outlet />
        </main>

      </div>
    </div>
  );
}