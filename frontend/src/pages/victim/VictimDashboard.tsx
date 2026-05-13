import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, MapPin, MessageSquare, Navigation, PhoneCall, Plus, Radio, Siren, UserRound } from 'lucide-react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import { connectSocket } from '../../services/socket';

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
  pending: 'Dang cho',
  assigned: 'Da tiep nhan',
  in_progress: 'Dang xu ly',
  completed: 'Hoan tat',
  cancelled: 'Da huy',
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

const markerIcon = (label: string, color: string) => L.divIcon({
  className: 'victim-tracker-marker',
  html: `<div style="width:34px;height:34px;border-radius:999px;background:${color};color:white;border:3px solid white;box-shadow:0 8px 20px rgba(15,23,42,.25);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;">${label}</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function FitTrackerMap({ victim, rescuer }: { victim: any; rescuer: any }) {
  const map = useMap();

  useEffect(() => {
    if (victim && rescuer) {
      map.fitBounds([[Number(victim.lat), Number(victim.lng)], [Number(rescuer.lat), Number(rescuer.lng)]], {
        padding: [42, 42],
        maxZoom: 15,
      });
    } else if (victim) {
      map.setView([Number(victim.lat), Number(victim.lng)], 14);
    }
  }, [map, victim, rescuer]);

  return null;
}

export default function VictimDashboard() {
  const [posts, setPosts] = useState<RescuePost[]>([]);
  const [dashboardCounts, setDashboardCounts] = useState<any>(null);
  const [latestStatus, setLatestStatus] = useState<any>(null);
  const [rescuerLocation, setRescuerLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingSos, setSendingSos] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/rescue-posts/victim-dashboard');
        const data = res.data.data;
        setPosts(data.recentRequests || []);
        setDashboardCounts(data.counts || null);
        setLatestStatus(data.latestStatus || null);
        if (data.latestStatus?.rescuer_lat && data.latestStatus?.rescuer_lng) {
          setRescuerLocation({ lat: data.latestStatus.rescuer_lat, lng: data.latestStatus.rescuer_lng });
        } else if (data.latestStatus?.id && ['assigned', 'in_progress'].includes(data.latestStatus.status)) {
          const latestLocation = await api.get(`/locations/latest/${data.latestStatus.id}`).catch(() => null);
          if (latestLocation?.data?.lat && latestLocation?.data?.lng) {
            setRescuerLocation(latestLocation.data);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts().catch(console.error);
  }, []);

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
      alert('Trinh duyet khong ho tro GPS');
      return;
    }
    setSendingSos(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const formData = new FormData();
        formData.append('title', `SOS - ${incidentType}`);
        formData.append('description', 'Yeu cau khan cap tao nhanh, se bo sung mo ta sau.');
        formData.append('urgency_level', '5');
        formData.append('address', 'Vi tri GPS hien tai');
        formData.append('lat', pos.coords.latitude.toString());
        formData.append('lng', pos.coords.longitude.toString());
        await api.post('/rescue-posts/post', formData);
        const res = await api.get('/rescue-posts/victim-dashboard');
        setPosts(res.data.data.recentRequests || []);
        setDashboardCounts(res.data.data.counts || null);
        setLatestStatus(res.data.data.latestStatus || null);
      } catch (error) {
        console.error(error);
        alert('Gui SOS that bai');
      } finally {
        setSendingSos(false);
      }
    }, () => {
      setSendingSos(false);
      alert('Khong lay duoc GPS');
    });
  };

  const confirmHelped = async () => {
    if (!latestStatus?.id) return;
    await api.post(`/assignments/confirm/${latestStatus.id}`, {
      rating: 5,
      feedback: 'Da duoc ho tro'
    });
    const res = await api.get('/rescue-posts/victim-dashboard');
    setLatestStatus(res.data.data.latestStatus || null);
  };

  const stats = useMemo(() => {
    if (dashboardCounts) return dashboardCounts;
    return {
      total: posts.length,
      pending: posts.filter(post => post.status === 'pending').length,
      active: posts.filter(post => ['assigned', 'in_progress'].includes(post.status)).length,
      completed: posts.filter(post => post.status === 'completed').length,
    };
  }, [posts]);

  const latestPosts = posts.slice(0, 5);
  const criticalPost = posts.find(post => post.status !== 'completed' && post.urgency_level >= 4);
  const activeTracking = latestStatus && ['assigned', 'in_progress'].includes(latestStatus.status);
  const victimPoint = latestStatus?.lat && latestStatus?.lng ? { lat: latestStatus.lat, lng: latestStatus.lng } : null;
  const distanceKm = estimateDistanceKm(rescuerLocation, latestStatus);
  const etaMinutes = distanceKm ? Math.max(1, Math.round((distanceKm / 25) * 60)) : null;

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <button
        type="button"
        disabled={sendingSos}
        onClick={() => sendQuickSos('Khan cap')}
        className="fixed bottom-6 right-6 z-[1300] inline-flex h-16 min-w-16 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-white shadow-2xl shadow-red-300 hover:bg-red-800 disabled:opacity-60"
        aria-label="Gui SOS khan cap"
      >
        <Siren size={26} />
        <span className="hidden sm:inline font-bold">{sendingSos ? 'Dang gui...' : 'SOS'}</span>
      </button>

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-red-600">LineLife</p>
            <h1 className="text-2xl font-bold text-slate-900">Bang dieu khien cuu ho</h1>
            <p className="text-sm text-slate-500 mt-1">Theo doi tinh trang cac yeu cau va tao SOS nhanh khi can.</p>
          </div>
          <Link
            to="/victim/create-request"
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-lg"
          >
            <Plus size={18} />
            Tao yeu cau moi
          </Link>
          <button
            type="button"
            disabled={sendingSos}
            onClick={() => sendQuickSos('Khan cap')}
            className="inline-flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-semibold px-4 py-3 rounded-lg disabled:opacity-60"
          >
            <Siren size={18} />
            {sendingSos ? 'Dang gui SOS...' : 'SOS nhanh'}
          </button>
        </div>

        {criticalPost && (
          <div className="bg-red-600 text-white rounded-lg p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <Siren className="flex-none mt-1" size={24} />
              <div>
                <h2 className="font-bold text-lg">Yeu cau khan cap dang duoc theo doi</h2>
                <p className="text-red-50 text-sm mt-1">{criticalPost.title}</p>
              </div>
            </div>
            <Link to="/victim/my-posts" className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold text-sm text-center">
              Xem chi tiet
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={<Radio size={20} />} label="Tong yeu cau" value={stats.total} />
          <StatCard icon={<Clock size={20} />} label="Dang cho" value={stats.pending} />
          <StatCard icon={<AlertTriangle size={20} />} label="Dang ho tro" value={stats.active} />
          <StatCard icon={<CheckCircle2 size={20} />} label="Hoan tat" value={stats.completed} />
        </div>

        <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="p-5 border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-red-600">Theo doi nhu giao hang</p>
              <h2 className="font-bold text-xl text-slate-900">
                {activeTracking ? 'Rescuer dang den ho tro ban' : 'Trang thai cuu ho gan nhat'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {latestStatus ? latestStatus.title : 'Chua co ca dang theo doi. Khi co rescuer nhan ca, thong tin se hien o day.'}
              </p>
            </div>
            <button
              type="button"
              disabled={sendingSos}
              onClick={() => sendQuickSos('Khan cap')}
              className="inline-flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-5 py-3 rounded-lg disabled:opacity-60"
            >
              <Siren size={20} />
              SOS khan cap
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr] gap-0">
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <TrackerStep label="Da gui" active={Boolean(latestStatus)} done={Boolean(latestStatus)} />
                <TrackerStep label="Da nhan ca" active={activeTracking} done={Boolean(latestStatus?.rescuer_id)} />
                <TrackerStep label="Hoan tat" active={latestStatus?.status === 'completed'} done={latestStatus?.status === 'completed'} />
              </div>

              {latestStatus?.rescuer_id ? (
                <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <UserRound size={22} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{latestStatus.rescuer_name}</p>
                      <p className="text-xs text-slate-500">Nguoi cuu ho dang ho tro</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <InfoPill icon={<PhoneCall size={16} />} label={latestStatus.rescuer_phone || 'Chua co so dien thoai'} />
                    <InfoPill icon={<Navigation size={16} />} label={distanceKm ? `${distanceKm.toFixed(1)} km` : 'Dang cho vi tri'} />
                    <InfoPill icon={<Clock size={16} />} label={etaMinutes ? `ETA ${etaMinutes} phut` : 'Chua tinh duoc ETA'} />
                    <InfoPill icon={<MapPin size={16} />} label={rescuerLocation ? `${Number(rescuerLocation.lat).toFixed(5)}, ${Number(rescuerLocation.lng).toFixed(5)}` : 'Chua co GPS rescuer'} />
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 rounded-lg p-4 text-sm text-slate-600">
                  {latestStatus
                    ? 'Chua co rescuer nhan ca nay. He thong se hien ten, so dien thoai, vi tri va ETA ngay khi co nguoi tiep nhan.'
                    : 'Chua co ca nao de theo doi. Bam SOS khan cap de tao yeu cau nhanh tu GPS hien tai.'}
                </div>
              )}

              {latestStatus?.status === 'completed' && !latestStatus.victim_confirmed_at && (
                <button
                  type="button"
                  onClick={confirmHelped}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg font-semibold text-sm hover:bg-emerald-700"
                >
                  <CheckCircle2 size={18} />
                  Xac nhan da duoc ho tro
                </button>
              )}
            </div>

            <div className="min-h-[320px] border-t lg:border-t-0 lg:border-l border-slate-200">
              {victimPoint ? (
                <MapContainer
                  center={[Number(victimPoint.lat), Number(victimPoint.lng)]}
                  zoom={14}
                  style={{ height: '100%', minHeight: 320, width: '100%', zIndex: 1 }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FitTrackerMap victim={victimPoint} rescuer={rescuerLocation} />
                  <Marker position={[Number(victimPoint.lat), Number(victimPoint.lng)]} icon={markerIcon('BAN', '#dc2626')} />
                  {rescuerLocation && (
                    <>
                      <Marker position={[Number(rescuerLocation.lat), Number(rescuerLocation.lng)]} icon={markerIcon('R', '#2563eb')} />
                      <Polyline
                        positions={[
                          [Number(victimPoint.lat), Number(victimPoint.lng)],
                          [Number(rescuerLocation.lat), Number(rescuerLocation.lng)],
                        ]}
                        pathOptions={{ color: '#2563eb', weight: 4, dashArray: '8 8' }}
                      />
                    </>
                  )}
                </MapContainer>
              ) : (
                <div className="h-full min-h-[320px] flex items-center justify-center text-sm text-slate-500">
                  Chua co toa do ca cuu ho de hien ban do.
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white border border-slate-200 rounded-lg">
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Yeu cau gan day</h2>
                <p className="text-sm text-slate-500">Cap nhat theo trang thai moi nhat trong he thong.</p>
              </div>
              <Link to="/victim/my-posts" className="text-sm font-semibold text-red-600 hover:text-red-700">
                Xem tat ca
              </Link>
            </div>

            <div className="divide-y">
              {loading ? (
                <div className="p-6 text-center text-slate-500">Dang tai du lieu...</div>
              ) : latestPosts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Ban chua co yeu cau nao. Hay tao yeu cau dau tien khi can ho tro.
                </div>
              ) : (
                latestPosts.map(post => (
                  <Link
                    key={post.id}
                    to="/victim/my-posts"
                    className="block p-5 hover:bg-slate-50 transition"
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
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[post.status]}`}>
                          {statusLabels[post.status]}
                        </span>
                        <span className="text-xs text-slate-500">Muc {post.urgency_level}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          <aside className="bg-white border border-slate-200 rounded-lg p-5 h-fit">
            <h2 className="font-bold text-slate-900">Tac vu nhanh</h2>
            <div className="mt-4 space-y-3">
              {['Chay', 'Tai nan', 'Ngap', 'Y te', 'Mac ket'].map(type => (
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
                <span className="font-semibold text-sm text-slate-800">Gui yeu cau SOS</span>
              </Link>
              <Link to="/victim/conversations" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50">
                <MessageSquare size={20} className="text-slate-600" />
                <span className="font-semibold text-sm text-slate-800">Mo tin nhan ho tro</span>
              </Link>
              <Link to="/victim/my-posts" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50">
                <Radio size={20} className="text-slate-600" />
                <span className="font-semibold text-sm text-slate-800">Theo doi vi tri va trang thai</span>
              </Link>
            </div>
          </aside>
        </div>

        {latestStatus && false && (
          <section className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-900">Trang thai cuu ho gan nhat</h2>
                <p className="text-sm text-slate-500 mt-1">{latestStatus.title} - {statusLabels[latestStatus.status as RescuePost['status']] || latestStatus.status}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles[latestStatus.status as RescuePost['status']] || 'bg-slate-100'}`}>
                Muc {latestStatus.urgency_level}
              </span>
            </div>
            {latestStatus.rescuer_id && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-700"><UserRound size={18} /> {latestStatus.rescuer_name}</div>
                <div className="flex items-center gap-2 text-slate-700"><Radio size={18} /> {latestStatus.rescuer_phone || 'Chua co SĐT'}</div>
                <div className="flex items-center gap-2 text-slate-700"><MapPin size={18} /> {rescuerLocation ? `${Number(rescuerLocation.lat).toFixed(5)}, ${Number(rescuerLocation.lng).toFixed(5)}` : 'Dang cho vi tri rescuer'}</div>
                <div className="flex items-center gap-2 text-slate-700"><Clock size={18} /> {distanceKm ? `${distanceKm.toFixed(1)} km - ETA ${etaMinutes} phut` : 'Chua tinh duoc ETA'}</div>
              </div>
            )}
            {latestStatus.status === 'completed' && !latestStatus.victim_confirmed_at && (
              <button
                type="button"
                onClick={confirmHelped}
                className="mt-4 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-700"
              >
                <CheckCircle2 size={18} />
                Xac nhan da duoc ho tro
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
