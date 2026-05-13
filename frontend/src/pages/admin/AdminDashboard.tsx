import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, UsersRound } from 'lucide-react';
import api from '../../services/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [role, setRole] = useState('');

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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin LineLife</h1>
            <p className="text-sm text-slate-500">Quan ly user, rescuer va thong ke ca cuu ho.</p>
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="border rounded-lg px-3 py-2">
            <option value="">Tat ca vai tro</option>
            <option value="victim">Victim</option>
            <option value="rescuer">Rescuer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Metric icon={<UsersRound size={20} />} label="Users" value={users.length} />
          <Metric icon={<BarChart3 size={20} />} label="Ca cuu ho" value={stats?.totals?.total_requests || requests.length} />
          <Metric icon={<CheckCircle2 size={20} />} label="Ty le hoan tat" value={`${stats?.totals?.completion_rate || 0}%`} />
          <Metric icon={<BarChart3 size={20} />} label="Phan hoi TB" value={`${stats?.totals?.avg_response_seconds || 0}s`} />
        </div>

        <section className="bg-white border rounded-lg overflow-hidden">
          <div className="p-4 border-b font-bold">User / Rescuer</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left p-3">Ten</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Nang luc</th>
                  <th className="text-left p-3">Trang thai</th>
                  <th className="text-right p-3">Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t">
                    <td className="p-3 font-medium">{user.full_name}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">{user.phone}</td>
                    <td className="p-3">{(user.rescuer_skills || []).join(', ') || user.vehicle_info || '-'}</td>
                    <td className="p-3">{user.is_active ? 'Active' : 'Inactive'}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => toggleActive(user)} className="px-3 py-1.5 rounded-lg border hover:bg-slate-50">
                        {user.is_active ? 'Khoa' : 'Kich hoat'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white border rounded-lg overflow-hidden">
          <div className="p-4 border-b font-bold">Tat ca ca cuu ho</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {requests.map(req => (
              <div key={req.id} className="border rounded-lg p-4">
                <div className="font-semibold">{req.title}</div>
                <div className="text-sm text-slate-500 mt-1">{req.address || 'Chua co dia chi'}</div>
                <div className="flex justify-between mt-3 text-xs">
                  <span>Muc {req.urgency_level}</span>
                  <span>{req.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-red-600">{icon}</div>
      <div className="text-sm text-slate-500 mt-3">{label}</div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
