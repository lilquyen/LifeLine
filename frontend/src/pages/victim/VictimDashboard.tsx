import { Link, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Loader2, MapPin, MessageSquare, Navigation, PhoneCall, Plus, Radio, Siren, UserRound } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import { connectSocket } from '../../services/socket';
import { RescuerTrackingMap } from '../../components/rescuer/RescuerTrackingMap';

interface RescuePost {
  id: number;
  title: string;
  description: string | null;
  urgency_level: number;
  address: string | null;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

const statusLabels: Record<RescuePost['status'], string> = {
  pending: 'Đang chờ',
  assigned: 'Đã tiếp nhận',
  in_progress: 'Đang xử lí',
  completed: 'Hoàn tất',
  cancelled: 'Đã huỷ',
};

const statusStyles: Record<RescuePost['status'], string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  assigned: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

const estimateDistanceKm = (a?: any, b?: any) => {
  if (!a || !b) return null;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(Number(a.lat) - Number(b.lat));
  const dLng = toRad(Number(a.lng) - Number(b.lng));
  const lat1 = toRad(Number(b.lat));
  const lat2 = toRad(Number(a.lat));
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export default function VictimDashboard() {
  const [posts, setPosts] = useState<RescuePost[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<any[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [dashboardCounts, setDashboardCounts] = useState<any>(null);
  const [latestStatus, setLatestStatus] = useState<any>(null);
  const [rescuerLocation, setRescuerLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingSos, setSendingSos] = useState(false);
  const navigate = useNavigate();
  const [updatingVictimLocation, setUpdatingVictimLocation] = useState(false);

  const fetchDashboard = useCallback(async (preferredRequestId?: number | null) => {
    const res = await api.get('/rescue-posts/victim-dashboard');
    const data = res.data.data;
    const accepted = data.acceptedRequests;
    const selected = preferredRequestId
      ? accepted.find((request: any) => request.id === preferredRequestId)
      : accepted[0];

    setPosts(data.recentRequests );
    setAcceptedRequests(accepted);
    setDashboardCounts(data.counts);
    setLatestStatus(selected);
    setSelectedRequestId(selected?.id);

    if (selected?.rescuer_lat && selected?.rescuer_lng) {
      setRescuerLocation({ lat: selected.rescuer_lat, lng: selected.rescuer_lng });
    } else if (selected?.id && ['assigned', 'in_progress'].includes(selected.status)) {
      const latestLocation = await api.get(`/locations/latest/${selected.id}`).catch(() => null);
      setRescuerLocation(latestLocation?.data?.lat && latestLocation?.data?.lng ? latestLocation.data : null);
    } else {
      setRescuerLocation(null);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(null)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchDashboard]);

  useEffect(() => {
    if (!selectedRequestId) return;
    const selected = acceptedRequests.find(request => request.id === selectedRequestId);
    if (!selected) return;

    setLatestStatus(selected);
    if (selected.rescuer_lat && selected.rescuer_lng) {
      setRescuerLocation({ lat: selected.rescuer_lat, lng: selected.rescuer_lng });
    } else {
      api.get(`/locations/latest/${selected.id}`)
        .then(res => setRescuerLocation(res.data?.lat && res.data?.lng ? res.data : null))
        .catch(() => setRescuerLocation(null));
    }
  }, [acceptedRequests, selectedRequestId]);

  useEffect(() => {
    if (!latestStatus?.id) return;
    const socket = connectSocket();
    socket?.emit('join_request', latestStatus.id);
    socket?.on('rescuer_location_updated', (location) => {
      if (location.request_id === latestStatus.id) setRescuerLocation(location);
    });
    return () => {
      socket?.emit('leave_request', latestStatus.id);
      socket?.off('rescuer_location_updated');
    };
  }, [latestStatus?.id]);

  const sendQuickSos = (incidentType = 'SOS') => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ GPS');
      return;
    }
    setSendingSos(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const formData = new FormData();
        formData.append('title', `SOS - ${incidentType}`);
        formData.append('description', 'Yêu cầu khẩn cấp');
        formData.append('urgency_level', '5');
        formData.append('address', 'Yêu cầu khẩn cấp, chưa có địa chỉ cụ thể. Lấy địa chỉ ở GPS');
        formData.append('lat', pos.coords.latitude.toString());
        formData.append('lng', pos.coords.longitude.toString());
        await api.post('/rescue-posts/post', formData);
        const res = await api.get('/rescue-posts/victim-dashboard');
        setPosts(res.data.data.recentRequests);
        setDashboardCounts(res.data.data.counts);
        setLatestStatus(res.data.data.latestStatus);

        navigate('/victim/my-posts');

        await fetchDashboard(selectedRequestId);
      } catch (error) {
        console.error(error); 
        alert('Gửi SOS thất bại');
      } finally {
        setSendingSos(false);
      }
    }, () => {
      setSendingSos(false);
      alert('Không lấy được GPS');
    });
  };

  const confirmHelped = async () => {
    if (!latestStatus?.id) return;
    await api.post(`/assignments/confirm/${latestStatus.id}`, {
      rating: 5,
      feedback: 'Đã được hỗ trợ'
    });
    await fetchDashboard(latestStatus.id);
  };

  const updateVictimLocation = () => {
    if (!latestStatus?.id) return;
    if (!navigator.geolocation) {
      alert('Trinh duyet khong ho tro GPS');
      return;
    }

    setUpdatingVictimLocation(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await api.put(`/rescue-posts/update/${latestStatus.id}`, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        await fetchDashboard(latestStatus.id);
      } catch (error) {
        console.error(error);
        alert('Cap nhat vi tri that bai');
      } finally {
        setUpdatingVictimLocation(false);
      }
    }, () => {
      setUpdatingVictimLocation(false);
      alert('Khong lay duoc GPS');
    });
  };

  const stats = useMemo(() => {
    if (dashboardCounts) return dashboardCounts;
    return {
      total: posts.length,
      pending: posts.filter(post => post.status === 'pending').length,
      active: posts.filter(post => ['assigned', 'in_progress'].includes(post.status)).length,
      completed: posts.filter(post => post.status === 'completed').length,
    };
  }, [dashboardCounts, posts]);

  const acceptedDisplay = acceptedRequests.slice(0, 5);
  const criticalPost = posts.find(post => post.status !== 'completed' && post.urgency_level >= 4);
  const activeTracking = latestStatus && ['assigned', 'in_progress'].includes(latestStatus.status);
  const victimPoint = latestStatus?.lat && latestStatus?.lng ? { lat: latestStatus.lat, lng: latestStatus.lng } : null;
  const distanceKm = estimateDistanceKm(rescuerLocation, latestStatus);
  const etaMinutes = distanceKm != null ? Math.max(1, Math.round((distanceKm / 25) * 60)) : null;
  const distanceText = distanceKm != null ? `${Number(distanceKm).toFixed(1)} km` : null;

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <button
        type="button"
        disabled={sendingSos}
        onClick={() => sendQuickSos('Khẩn Cấp')}
        className="fixed bottom-6 right-6 z-[1300] inline-flex h-16 min-w-16 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-white shadow-2xl shadow-red-300 hover:bg-red-800 disabled:opacity-60"
        aria-label="Gửi SOS khẩn cấp"
      >
        <Siren size={26} />
        <span className="hidden sm:inline font-bold">{sendingSos ? 'Đang gửi' : 'SOS'}</span>
      </button>

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-red-600">LineLife</p>
            <h1 className="text-2xl font-bold text-slate-900">Trang chủ gửi yêu cầu cứu hộ</h1>
            <p className="text-sm text-slate-500 mt-1">Theo dõi tình trạng các yêu cầu, gửi yêu cầu khẩn cấp</p>
          </div>
          <Link
            to="/victim/create-request"
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-lg"
          >
            <Plus size={18} />
            Tạo yêu cầu mới
          </Link>
          <button
            type="button"
            disabled={sendingSos}
            onClick={() => sendQuickSos('Khẩn cấp')}
            className="inline-flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-3 rounded-lg disabled:opacity-60"
          >
            <Siren size={18} />
            {sendingSos ? 'Đang gửi SOS...' : 'SOS khẩn cấp'}
          </button>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={<Radio size={20} />} label="Tổng yêu cầu" value={stats.total} />
          <StatCard icon={<Clock size={20} />} label="Đang chờ" value={stats.pending} />
          <StatCard icon={<AlertTriangle size={20} />} label="Đang hỗ trợ" value={stats.active} />
          <StatCard icon={<CheckCircle2 size={20} />} label="Hoàn tất" value={stats.completed} />
        </div>

        <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="p-5 border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="font-bold text-xl text-slate-900">
                {activeTracking ? 'Người cứu hộ đang tới' : 'Trạng thái cứu hộ gần nhất'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {latestStatus ? latestStatus.title : 'Chưa có ca cứu hộ nào được chấp nhận.'}
              </p>
            </div>
            {/* <button
              type="button"
              disabled={sendingSos}
              onClick={() => sendQuickSos('Khẩn cấp')}
              className="inline-flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-5 py-3 rounded-lg disabled:opacity-60"
            >
              <Siren size={20} />
              SOS khẩn cấp
            </button> */}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr] gap-0">
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <TrackerStep label="Đã gửi" active={Boolean(latestStatus)} done={Boolean(latestStatus)} />
                <TrackerStep label="Đã nhận ca" active={activeTracking} done={Boolean(latestStatus?.rescuer_id)} />
                <TrackerStep label="Hoàn tất" active={latestStatus?.status === 'completed'} done={latestStatus?.status === 'completed'} />
              </div>

              {latestStatus?.rescuer_id ? (
                <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <UserRound size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{latestStatus.rescuer_name}</p>
                      <p className="text-xs text-slate-500">Người cứu hộ đang hỗ trợ</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <InfoPill icon={<PhoneCall size={16} />} label={latestStatus.rescuer_phone || 'Chưa có số điện thoại'} />
                    <InfoPill icon={<Navigation size={16} />} label={distanceKm ? `${distanceKm.toFixed(1)} km` : 'Đang chờ vị trí được cập nhật'} />
                    <InfoPill icon={<Clock size={16} />} label={etaMinutes ? `ETA ${etaMinutes} phút` : 'Chưa tính được ETA'} />
                    <InfoPill icon={<MapPin size={16} />} label={rescuerLocation ? `${Number(rescuerLocation.lat).toFixed(5)}, ${Number(rescuerLocation.lng).toFixed(5)}` : 'Chưa có GPS của người cứu hộ'} />
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 rounded-lg p-4 text-sm text-slate-600">
                  {latestStatus
                    ? 'Chưa có người cứu hộ nhận ca này. Hệ thống đang tìm kiếm tình nguyện viên gần nhất để hỗ trợ bạn.'
                    : 'Chưa có ca nào để theo dõi. Hãy tạo một yêu cầu cứu hộ để hệ thống có thể kết nối bạn với tình nguyện viên.'}
                </div>
              )}

              {latestStatus?.status === 'completed' && !latestStatus.victim_confirmed_at && (
                <button
                  type="button"
                  onClick={confirmHelped}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg font-semibold text-sm hover:bg-emerald-700"
                >
                  <CheckCircle2 size={18} />
                  Xác nhận đã được hỗ trợ
                </button>
              )}

              {latestStatus && (
                <button
                  type="button"
                  onClick={updateVictimLocation}
                  disabled={updatingVictimLocation}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {updatingVictimLocation ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
                  {updatingVictimLocation ? 'Đang cập nhật vị trí...' : 'Cập nhật vị trí của tôi'}
                </button>
              )}
            </div>

            <div className="min-h-[320px] border-t lg:border-t-0 lg:border-l border-slate-200">
              {victimPoint ? (
                <RescuerTrackingMap
                  victim={victimPoint}
                  rescuer={rescuerLocation}
                  victimLabel="BAN"
                  rescuerLabel="R"
                />
              ) : (
                <div className="h-full min-h-[320px] flex items-center justify-center text-sm text-slate-500">
                  Chưa có toạ độ ca cứu hộ
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white border border-slate-200 rounded-lg">
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Yêu cầu đã được tiếp nhận</h2>
                <p className="text-sm text-slate-500">Cập nhật theo trạng thái mới nhất của hệ thống</p>
              </div>
              <Link to="/victim/my-posts" className="text-sm font-semibold text-red-600 hover:text-red-700">
                Xem tất cả
              </Link>
            </div>

            <div className="divide-y">
              {loading ? (
                <div className="p-6 text-center text-slate-500">Đang tải dữ liệu</div>
              ) : posts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Bạn chưa có yêu cầu nào. Hãy tạo yêu cầu nếu bạn cần hỗ trợ
                </div>
              ) : (
                acceptedDisplay.map(post => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setSelectedRequestId(post.id)}
                    className={`block w-full p-5 text-left transition ${selectedRequestId === post.id ? 'bg-red-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">{post.title}</h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                          {post.address || post.description || 'Chua co mo ta dia diem'}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(post.created_at).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[post.status as RescuePost['status']] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {statusLabels[post.status as RescuePost['status']] || post.status}
                        </span>
                        <span className="text-xs text-slate-500">Mức {post.urgency_level}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          <aside className="bg-white border border-slate-200 rounded-lg p-5 h-fit">
            <h2 className="font-bold text-slate-900">Tác vụ nhanh</h2>
            <div className="mt-4 space-y-3">
              {['Cháy', 'Tai nạn', 'Ngập', 'Y tế', 'Mắc kẹt'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => sendQuickSos(type)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-red-50 hover:border-red-200 text-left"
                >
                  <Siren size={20} className="text-red-600" />
                  <span className="font-semibold text-sm text-slate-800">SOS {type}</span>
                </button>
              ))}
              <Link to="/victim/create-request" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-red-50 hover:border-red-200">
                <Siren size={20} className="text-red-600" />
                <span className="font-semibold text-sm text-slate-800">Gửi yêu cầu SOS</span>
              </Link>
              <Link to="/victim/conversations" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50">
                <MessageSquare size={20} className="text-slate-600" />
                <span className="font-semibold text-sm text-slate-800">Mở tin nhắn</span>
              </Link>
              <Link to="/victim/my-posts" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50">
                <Radio size={20} className="text-slate-600" />
                <span className="font-semibold text-sm text-slate-800">Theo dõi vị trí và trạng thái</span>
              </Link>
            </div>
          </aside>
        </div>

        {latestStatus && false && (
          <section className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-900">Trạng thái cứu trợ gần nhất</h2>
                <p className="text-sm text-slate-500 mt-1">{latestStatus.title} - {statusLabels[latestStatus.status as RescuePost['status']] || latestStatus.status}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[latestStatus.status as RescuePost['status']] || 'bg-slate-100'}`}>
                Mức {latestStatus.urgency_level}
              </span>
            </div>
            {latestStatus.rescuer_id && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-700"><UserRound size={18} /> {latestStatus.rescuer_name}</div>
                <div className="flex items-center gap-2 text-slate-700"><Radio size={18} /> {latestStatus.rescuer_phone || 'Chưa có SĐT'}</div>
                <div className="flex items-center gap-2 text-slate-700"><MapPin size={18} /> {rescuerLocation ? `${Number(rescuerLocation.lat).toFixed(5)}, ${Number(rescuerLocation.lng).toFixed(5)}` : 'Dang cho vi tri rescuer'}</div>
                
              </div>
            )}
            {latestStatus.status === 'completed' && !latestStatus.victim_confirmed_at && (
              <button
                type="button"
                onClick={confirmHelped}
                className="mt-4 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-700"
              >
                <CheckCircle2 size={18} />
                Xác nhận đã được hỗ trợ
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm text-slate-500 mt-4">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function TrackerStep({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className={`rounded-lg border p-3 text-center ${active || done ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
      <div className={`mx-auto mb-2 h-3 w-3 rounded-full ${active || done ? 'bg-red-600' : 'bg-slate-300'}`} />
      <p className="text-xs font-bold">{label}</p>
    </div>
  );
}

function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-slate-700">
      <span className="text-slate-500">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}
