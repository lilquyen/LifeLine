import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RescuerMap } from '../../components/rescuer/RescuerMap';
import { PendingRequestsList } from '../../components/rescuer/PendingRequestsList';
import { RequestDetailModal } from '../../components/rescuer/RequestDetailModal';
import { ConfirmAcceptModal } from '../../components/rescuer/ConfirmAcceptModal';
import { LocationUpdater } from '../../components/rescuer/LocationUpdater';
import { fetchPendingRequestsFiltered, assignRequest, updateLocation, fetchAllRequestsFiltered } from '../../services/rescuerApi';

export default function RescuerDashboard() {
  const [pending, setPending] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);   // cho modal chi tiết
  const [acceptingId, setAcceptingId] = useState<number | null>(null);              // cho modal xác nhận
  const [loading, setLoading] = useState(true);
  const [rescuerLocation, setRescuerLocation] = useState<{ lat: number; lng: number; name: string } | undefined>();
  const [filters, setFilters] = useState({ urgency_level: '', q: '', address: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadPending();
    loadAllRequests();
    const savedLat = localStorage.getItem('rescuer_lat');
    const savedLng = localStorage.getItem('rescuer_lng');
    if (savedLat && savedLng) {
      setRescuerLocation({ lat: parseFloat(savedLat), lng: parseFloat(savedLng), name: 'Vị trí của bạn' });
    }
  }, []);

  useEffect(() => {
    loadPending();
    loadAllRequests();
  }, [filters.urgency_level, filters.q, filters.address]);

  const loadPending = async () => {
    try {
      const params: Record<string, any> = {
        ...filters,
        lat: rescuerLocation?.lat,
        lng: rescuerLocation?.lng,
      };
      Object.keys(params).forEach(key => (params[key] === '' || params[key] == null) && delete params[key]);
      const res = await fetchPendingRequestsFiltered(params);
      setPending(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllRequests = async () => {
    try {
      const params: Record<string, any> = { ...filters };
      Object.keys(params).forEach(key => params[key] === '' && delete params[key]);
      const res = await fetchAllRequestsFiltered(params);
      setAllRequests(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAcceptRequest = (requestId: number) => {
    setAcceptingId(requestId);
  };

  const handleConfirmAccept = async (lat: number, lng: number) => {
    if (!acceptingId) return;
    // Cập nhật vị trí
    await updateLocation(lat, lng);
    // Nhận ca
    const assignRes = await assignRequest(acceptingId);
    const conversation = assignRes.data.conversation;
    if (conversation && conversation.id) {
      navigate(`/rescuer/conversations/${conversation.id}`);
    }
    // Refresh danh sách pending
    await loadPending();
    setAcceptingId(null);
  };

  const getRequestTitle = (id: number) => {
    const req = pending.find(r => r.id === id);
    return req ? req.title : '';
  };

  const mapPosts = allRequests.map(post => ({
    id: post.id,
    lat: post.lat,
    lng: post.lng,
    title: post.title,
    status: post.status,
    urgencyLevel: post.urgency_level, 
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold">Bản đồ cứu hộ</h1>
        <LocationUpdater onLocationUpdate={(lat, lng) => setRescuerLocation({ lat, lng, name: 'Vị trí của bạn' })} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: danh sách pending */}
        <div className="w-80 bg-white border-r flex flex-col overflow-hidden">
          <div className="p-3 border-b bg-gray-50 space-y-3">
            <div className="font-semibold">Cac ca chua nhan ({pending.length})</div>
            <input
              value={filters.q}
              onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
              placeholder="Tim theo tieu de/mo ta"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <input
              value={filters.address}
              onChange={(e) => setFilters(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Khu vuc/dia chi"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <select
              value={filters.urgency_level}
              onChange={(e) => setFilters(prev => ({ ...prev, urgency_level: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Moi muc do</option>
              <option value="5">Muc 5</option>
              <option value="4">Muc 4</option>
              <option value="3">Muc 3</option>
              <option value="2">Muc 2</option>
              <option value="1">Muc 1</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">Đang tải...</div>
            ) : (
              <PendingRequestsList
                requests={pending}
                onSelect={setSelectedRequestId}
                onAccept={handleAcceptRequest}
              />
            )}
          </div>
        </div>

        {/* Right panel: map */}
        <div className="flex-1 relative">
          <RescuerMap posts={mapPosts} rescuerLocation={rescuerLocation} onPostClick={setSelectedRequestId} />
        </div>
      </div>

      {/* Modal chi tiết */}
      <RequestDetailModal
        requestId={selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
        onAccept={handleAcceptRequest}
      />

      {/* Modal xác nhận nhận ca */}
      {acceptingId && (
        <ConfirmAcceptModal
          requestId={acceptingId}
          requestTitle={getRequestTitle(acceptingId)}
          onClose={() => setAcceptingId(null)}
          onConfirm={handleConfirmAccept}
        />
      )}
    </div>
  );
}
