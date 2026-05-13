import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { AssignmentCard } from '../../components/rescuer/AssignmentCard';
import { fetchAllRequests, fetchMyAssignments, getConversationByRequest, updateLocation, updateLocationHistory } from '../../services/rescuerApi';
import { RequestDetail } from '../../components/rescuer/RequestDetail';
import { useNavigate } from 'react-router-dom';
import { Clock, LocateFixed, MapPin, Navigation } from 'lucide-react';
import { RescuerTrackingMap } from '../../components/rescuer/RescuerTrackingMap';

const ACTIVE_STATUSES = ['accepted', 'in_progress'];

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

export default function RescuerAssignments() {
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [myAssignments, setMyAssignments] = useState<any[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingMine, setLoadingMine] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [selectedTrackingRequestId, setSelectedTrackingRequestId] = useState<number | null>(null);
  const [rescuerLocation, setRescuerLocation] = useState<{ lat: number; lng: number } | null>(() => {
    const lat = localStorage.getItem('rescuer_lat');
    const lng = localStorage.getItem('rescuer_lng');
    return lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
  });
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [trackingError, setTrackingError] = useState('');
  const [trackingStatus, setTrackingStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadAllRequests();
    loadMyAssignments();
  }, []);

  const activeAssignments = useMemo(
    () => myAssignments.filter(assign => ACTIVE_STATUSES.includes(assign.assignment_status)),
    [myAssignments]
  );

  useEffect(() => {
    if (activeAssignments.length === 0) {
      setSelectedTrackingRequestId(null);
      return;
    }

    const selectedStillActive = activeAssignments.some(assign => assign.request_id === selectedTrackingRequestId);
    if (!selectedStillActive) {
      setSelectedTrackingRequestId(activeAssignments[0].request_id);
    }
  }, [activeAssignments, selectedTrackingRequestId]);

  const selectedTrackingAssignment = activeAssignments.find(assign => assign.request_id === selectedTrackingRequestId) || activeAssignments[0];
  const victimLocation = selectedTrackingAssignment ? { lat: Number(selectedTrackingAssignment.lat), lng: Number(selectedTrackingAssignment.lng) } : null;
  const distanceKm = estimateDistanceKm(rescuerLocation, victimLocation);
  const etaMinutes = distanceKm ? Math.max(1, Math.round((distanceKm / 25) * 60)) : null;

  useEffect(() => {
    if (!trackingEnabled || activeAssignments.length === 0) return;

    if (!navigator.geolocation) {
      setTrackingError('Trình duyệt không hỗ trợ GPS');
      return;
    }

    let latestLocation = rescuerLocation;
    let syncing = false;

    const syncLocation = async (nextLocation: { lat: number; lng: number }) => {
      if (syncing) return;
      syncing = true;
      try {
        await updateLocation(nextLocation.lat, nextLocation.lng);
        const results = await Promise.allSettled(
          activeAssignments.map(assign =>
            updateLocationHistory(assign.request_id, nextLocation.lat, nextLocation.lng)
          )
        );
        const failedCount = results.filter(result => result.status === 'rejected').length;
        const successCount = results.length - failedCount;

        if (failedCount > 0) {
          setTrackingError(`Đã gửi vị trí cho ${successCount}/${results.length} ca. ${failedCount} ca chưa đồng bộ được.`);
        } else {
          setTrackingError('');
        }
        setTrackingStatus(`Đã đồng bộ ${successCount}/${results.length} ca lúc ${new Date().toLocaleTimeString('vi-VN')}`);
      } catch (error) {
        console.error(error);
        setTrackingError('Không đồng bộ được vị trí người cứu hộ lên server. Hãy kiểm tra backend, token đăng nhập hoặc quyền tài khoản.');
      } finally {
        syncing = false;
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const nextLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        latestLocation = nextLocation;
        setRescuerLocation(nextLocation);
        localStorage.setItem('rescuer_lat', String(nextLocation.lat));
        localStorage.setItem('rescuer_lng', String(nextLocation.lng));
        await syncLocation(nextLocation);
      },
      (error) => {
        console.error(error);
        setTrackingError('Không lấy được GPS. Hãy cấp quyền vị trí cho trình duyệt.');
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    const syncInterval = window.setInterval(() => {
      if (latestLocation) {
        syncLocation(latestLocation);
      }
    }, 15000);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.clearInterval(syncInterval);
    };
  }, [trackingEnabled, activeAssignments]);

  const loadAllRequests = async () => {
    setLoadingAll(true);
    try {
      const res = await fetchAllRequests();
      setAllRequests(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAll(false);
    }
  };

  const loadMyAssignments = async () => {
    setLoadingMine(true);
    try {
      const res = await fetchMyAssignments();
      setMyAssignments(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMine(false);
    }
  };

  const handleMessage = async (requestId: number) => {
    try {
      const convRes = await getConversationByRequest(requestId);
      if (convRes.data.success) {
        navigate(`/rescuer/conversations/${convRes.data.data.id}`);
      } else {
        alert('Không thể mở hội thoại');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi khi mở chat');
    }
  };

  const handleViewDetail = (requestId: number) => {
    setSelectedRequestId(requestId);
  };

  const handleViewLocation = (requestId: number) => {
    setSelectedTrackingRequestId(requestId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Quản lý ca cứu hộ</h1>
      <section className="bg-white border rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-600">Theo dõi đường đến nạn nhân</p>
            <h2 className="text-lg font-bold text-slate-900">
              {selectedTrackingAssignment ? selectedTrackingAssignment.request_title : 'Chưa có ca đang nhận'}
            </h2>
            <p className="text-sm text-slate-500">
              {selectedTrackingAssignment ? selectedTrackingAssignment.address : 'Nhận một ca để hiện bản đồ nạn nhân - rescuer và tự động cập nhật vị trí.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTrackingEnabled(prev => !prev)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              trackingEnabled ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <LocateFixed size={18} />
            {trackingEnabled ? 'Đang tự động gửi vị trí' : 'Bật theo dõi GPS'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr]">
          <div className="p-4 space-y-3">
            <InfoRow icon={<MapPin size={18} />} label="Vị trí nạn nhân" value={victimLocation ? `${victimLocation.lat.toFixed(5)}, ${victimLocation.lng.toFixed(5)}` : 'Chưa có'} />
            <InfoRow icon={<Navigation size={18} />} label="Vị trí của bạn" value={rescuerLocation ? `${rescuerLocation.lat.toFixed(5)}, ${rescuerLocation.lng.toFixed(5)}` : 'Đang chờ GPS'} />
            <InfoRow icon={<Clock size={18} />} label="Khoảng cách / ETA" value={distanceKm ? `${distanceKm.toFixed(1)} km - ETA ${etaMinutes} phút` : 'Chưa tính được'} />
            {activeAssignments.length > 1 && (
              <div className="text-xs text-slate-500">
                Có {activeAssignments.length} ca đang nhận. Bấm “Vị trí” trên từng ca để xem bản đồ riêng của ca đó.
              </div>
            )}
            {trackingError && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{trackingError}</div>}
            {trackingStatus && !trackingError && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">{trackingStatus}</div>}
            <div className="text-xs text-slate-500">
              Khi bật theo dõi, trình duyệt tự gửi vị trí mới cho tất cả ca đang nhận mỗi khi GPS thay đổi.
            </div>
          </div>
          <div className="min-h-[340px] border-t lg:border-t-0 lg:border-l">
            <RescuerTrackingMap victim={victimLocation} rescuer={rescuerLocation} />
          </div>
        </div>
      </section>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tất cả các ca</TabsTrigger>
          <TabsTrigger value="active">Ca đã nhận</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingAll ? (
              <div>Đang tải...</div>
            ) : allRequests.length === 0 ? (
              <div>Không có ca nào</div>
            ) : (
              allRequests.map((req) => (
                <div key={req.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md">
                  <div className="font-bold">{req.title}</div>
                  <div className="text-sm text-gray-500 mt-1 line-clamp-2">{req.description || 'Không có mô tả'}</div>
                  <div className="text-xs text-gray-400 mt-2">Địa chỉ: {req.address}</div>
                  <div className="flex justify-between items-center mt-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        req.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : req.status === 'assigned'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {req.status === 'pending'
                          ? 'Chưa nhận'
                          : req.status === 'assigned'
                          ? 'Đã nhận'
                          : 'Hoàn thành'}
                      </span>

                    <button onClick={() => handleViewDetail(req.id)} className="text-blue-600 text-sm hover:underline">Chi tiết</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingMine ? (
              <div>Đang tải...</div>
            ) : activeAssignments.length === 0 ? (
              <div>Bạn chưa có ca đang nhận</div>
            ) : (
              activeAssignments.map((assign) => (
                <AssignmentCard
                  key={assign.assignment_id}
                  assignment={assign}
                  onMessage={handleMessage}
                  onViewDetail={handleViewDetail}
                  onViewLocation={handleViewLocation}
                  onAssignmentUpdate={() => {
                    loadMyAssignments();
                    loadAllRequests();
                  }}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedRequestId !== null && (
        <RequestDetail
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-slate-50 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-semibold text-slate-800 text-right">{value}</span>
    </div>
  );
}
