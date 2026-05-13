import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, UsersRound, LogOut, AlertTriangle, Flame, Clock, TrendingUp, PieChart, Award, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import api from '../../services/api';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [role, setRole] = useState('');
  const [topRescuers, setTopRescuers] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [statusStats, setStatusStats] = useState<any>(null);
  const navigate = useNavigate();

  // Hàm tải dữ liệu
  const loadUsers = async () => {
    try {
      const res = await api.get('/auth/admin/users', { params: role ? { role } : {} });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Lỗi tải users', err);
    }
  };

  const loadRequests = async () => {
    try {
      const res = await api.get('/rescue-posts');
      setRequests(res.data || []);
    } catch (err) {
      console.error('Lỗi tải requests', err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get('/rescue-posts/admin/stats');
      setStats(res.data.data || null);
    } catch (err) {
      console.error('Lỗi tải stats', err);
    }
  };

  const loadTopRescuers = async () => {
    try {
      const res = await api.get('/stats/top-rescuers');
      setTopRescuers(res.data.data || []);
      while (topRescuers.length < 3) {
        topRescuers.push({ full_name: 'Chưa có dữ liệu', completed_count: 0, placeholder: true });
      }
      setTopRescuers([...topRescuers]);
    } catch (err) {
      console.error('Lỗi tải top rescuers', err);
    }
  };

  const loadWeeklyStats = async () => {
    try {
      const res = await api.get('/stats/weekly');
      setWeeklyStats(res.data.data || []);
    } catch (err) {
      console.error('Lỗi tải weekly stats', err);
    }
  };

  const loadStatusStats = async () => {
    try {
      const res = await api.get('/stats/status');
      setStatusStats(res.data.data || null);
    } catch (err) {
      console.error('Lỗi tải status stats', err);
    }
  };

  const loadAll = async () => {
    await Promise.all([
      loadUsers(),
      loadRequests(),
      loadStats(),
      loadTopRescuers(),
      loadWeeklyStats(),
      loadStatusStats()
    ]);
  };

  useEffect(() => {
    loadAll();
  }, [role]);

  const toggleActive = async (user: any) => {
    await api.patch(`/auth/admin/users/${user.id}/active`, { is_active: !user.is_active });
    await loadAll();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Chuẩn bị dữ liệu cho biểu đồ trạng thái
  const pieData = statusStats ? [
    { name: 'Chờ xử lý', value: statusStats.pending || 0, color: '#f97316' },
    { name: 'Đã nhận', value: statusStats.assigned || 0, color: '#3b82f6' },
    { name: 'Hoàn thành', value: statusStats.completed || 0, color: '#10b981' },
    { name: 'Đã hủy', value: statusStats.cancelled || 0, color: '#ef4444' }
  ] : [];

  // Hàm lấy màu sắc theo urgency_level
  const getLevelStyle = (level: number) => {
    switch (level) {
      case 5: return { bg: 'bg-red-700', border: 'border-red-800', text: 'text-red-800', label: 'Cực kỳ nguy cấp' };
      case 4: return { bg: 'bg-red-500', border: 'border-red-600', text: 'text-red-600', label: 'Nguy cấp' };
      case 3: return { bg: 'bg-orange-400', border: 'border-orange-500', text: 'text-orange-600', label: 'Khẩn cấp' };
      case 2: return { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-yellow-700', label: 'Bình thường' };
      default: return { bg: 'bg-gray-400', border: 'border-gray-500', text: 'text-gray-600', label: 'Thấp' };
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>

        {/* Thẻ metric tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Metric icon={<UsersRound size={20} />} label="Người dùng" value={users.length} />
          <Metric icon={<BarChart3 size={20} />} label="Tổng ca cứu hộ" value={stats?.totals?.total_requests || 0} />
          <Metric icon={<CheckCircle2 size={20} />} label="Tỷ lệ hoàn thành" value={`${stats?.totals?.completion_rate || 0}%`} />
          <Metric icon={<Clock size={20} />} label="Phản hồi TB" value={`${Math.round(stats?.totals?.avg_response_seconds || 0)} giây`} />
        </div>

        {/* Hàng biểu đồ: 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Biểu đồ cột: Yêu cầu theo ngày */}
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-red-500" />
              <h3 className="font-bold text-slate-800">Số lượng yêu cầu theo ngày (7 ngày qua)</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#ef4444" name="Số ca" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Biểu đồ tròn: Phân bố trạng thái */}
          <div className="bg-white border rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <PieChart size={20} className="text-red-500" />
              <h3 className="font-bold text-slate-800">Phân bố trạng thái ca cứu hộ</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ cột: Top rescuer */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={20} className="text-yellow-500" />
            <h2 className="font-bold text-lg">Top cứu hộ viên hoàn thành nhiều ca nhất</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topRescuers} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 'dataMax + 1']} allowDecimals={false} />
              <YAxis type="category" dataKey="full_name" />
              <Tooltip formatter={(value, name, props) => [`${value} ca`, props.payload.placeholder ? 'Chưa có dữ liệu' : 'Số ca hoàn thành']} />
              <Bar dataKey="completed_count" fill="#3b82f6" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bảng người dùng - có dropdown lọc vai trò ngay trong header */}
        <section className="bg-white border rounded-lg overflow-hidden shadow-sm">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center flex-wrap gap-3">
            <div className="font-bold">👥 Người dùng / Cứu hộ viên</div>
            <div className="flex gap-2">
              <span className="text-sm text-slate-500 self-center">Lọc theo vai trò:</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border rounded-lg px-3 py-1.5 bg-white text-sm"
              >
                <option value="">Tất cả</option>
                <option value="victim">Victim</option>
                <option value="rescuer">Rescuer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
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

        {/* Danh sách ca cứu hộ với màu sắc */}
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