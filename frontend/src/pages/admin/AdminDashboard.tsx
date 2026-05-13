import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, UsersRound, LogOut, AlertTriangle, Flame, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [role, setRole] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    const [usersRes, requestsRes, statsRes] = await Promise.all([
      api.get('/auth/admin/users', { params: role ? { role } : {} }),
      api.get('/rescue-posts'),
      api.get('/rescue-posts/admin/stats'),
    ]);
    setUsers(usersRes.data.data || []);
    setRequests(requestsRes.data || []);
    setStats(statsRes.data.data || null);
  };

  useEffect(() => {
    load().catch(console.error);
  }, [role]);

  const toggleActive = async (user: any) => {
    await api.patch(`/auth/admin/users/${user.id}/active`, { is_active: !user.is_active });
    await load();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Hàm lấy màu sắc và icon theo urgency_level
  const getLevelStyle = (level: number) => {
    switch (level) {
      case 5:
        return { bg: 'bg-red-700', border: 'border-red-800', text: 'text-red-800', icon: <Flame size={16} className="text-white" />, label: 'Cực kỳ nguy cấp' };
      case 4:
        return { bg: 'bg-red-500', border: 'border-red-600', text: 'text-red-600', icon: <AlertTriangle size={16} className="text-white" />, label: 'Nguy cấp' };
      case 3:
        return { bg: 'bg-orange-400', border: 'border-orange-500', text: 'text-orange-600', icon: <AlertTriangle size={16} className="text-white" />, label: 'Khẩn cấp' };
      case 2:
        return { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-yellow-700', icon: <Clock size={16} className="text-white" />, label: 'Bình thường' };
      default:
        return { bg: 'bg-gray-400', border: 'border-gray-500', text: 'text-gray-600', icon: <Clock size={16} />, label: 'Thấp' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header với nút logout */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin LineLife</h1>
            <p className="text-sm text-slate-500">Quản lý user, rescuer và thống kê ca cứu hộ.</p>
          </div>
          <div className="flex gap-3">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border rounded-lg px-3 py-2 bg-white"
            >
              <option value="">Tất cả vai trò</option>
              <option value="victim">Victim</option>
              <option value="rescuer">Rescuer</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Thẻ thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Metric icon={<UsersRound size={20} />} label="Users" value={users.length} />
          <Metric icon={<BarChart3 size={20} />} label="Ca cứu hộ" value={stats?.totals?.total_requests || requests.length} />
          <Metric icon={<CheckCircle2 size={20} />} label="Tỷ lệ hoàn tất" value={`${stats?.totals?.completion_rate || 0}%`} />
          <Metric icon={<Clock size={20} />} label="Phản hồi TB" value={`${stats?.totals?.avg_response_seconds || 0}s`} />
        </div>

        {/* Bảng người dùng */}
        <section className="bg-white border rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 border-b font-bold bg-gray-50">👥 Người dùng / Cứu hộ viên</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="text-left p-3">Họ tên</th>
                  <th className="text-left p-3">Vai trò</th>
                  <th className="text-left p-3">SĐT</th>
                  <th className="text-left p-3">Kỹ năng / PT</th>
                  <th className="text-left p-3">Trạng thái</th>
                  <th className="text-right p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{user.full_name}</td>
                    <td className="p-3 capitalize">{user.role}</td>
                    <td className="p-3">{user.phone || '—'}</td>
                    <td className="p-3 text-gray-500">
                      {(user.rescuer_skills || []).join(', ') || user.vehicle_info || '—'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {user.is_active ? 'Hoạt động' : 'Khóa'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleActive(user)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs hover:bg-gray-100 transition"
                      >
                        {user.is_active ? 'Khóa' : 'Kích hoạt'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Danh sách ca cứu hộ với màu sắc theo mức độ */}
        <section className="bg-white border rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 border-b font-bold bg-gray-50">🚨 Tất cả ca cứu hộ</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {requests.map(req => {
              const style = getLevelStyle(req.urgency_level);
              return (
                <div
                  key={req.id}
                  className={`border-l-8 ${style.border} rounded-lg shadow-sm hover:shadow-md transition-all bg-white overflow-hidden`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-slate-800">{req.title}</div>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${style.bg}`}>
                        Cấp {req.urgency_level}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                      {req.description || 'Không có mô tả'}
                    </p>
                    <div className="text-xs text-slate-400 mt-3 flex items-center gap-2">
                      <span className="truncate">{req.address || 'Chưa có địa chỉ'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-3 text-xs">
                      <span className={`capitalize px-2 py-0.5 rounded-full ${
                        req.status === 'completed' ? 'bg-green-100 text-green-700' :
                        req.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {req.status === 'completed' ? 'Hoàn thành' :
                         req.status === 'assigned' ? 'Đang xử lý' : 'Chờ tiếp nhận'}
                      </span>
                      <span className="text-slate-400">{new Date(req.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="text-red-500">{icon}</div>
      <div className="text-sm text-slate-500 mt-3">{label}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}