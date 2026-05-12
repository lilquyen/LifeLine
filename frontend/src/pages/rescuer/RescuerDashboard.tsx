import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RescuerMap } from '../../components/rescuer/RescuerMap';
import { PendingRequestsList } from '../../components/rescuer/PendingRequestsList';
import { RequestDetailModal } from '../../components/rescuer/RequestDetailModal';
import { ConfirmAcceptModal } from '../../components/rescuer/ConfirmAcceptModal';
import { LocationUpdater } from '../../components/rescuer/LocationUpdater';
import { fetchPendingRequests, assignRequest, updateLocation, fetchAllRequests } from '../../services/rescuerApi';

export default function RescuerDashboard() {
  const [pending, setPending] = useState<any[]>([]);
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);   // cho modal chi tiết
  const [acceptingId, setAcceptingId] = useState<number | null>(null);              // cho modal xác nhận
  const [loading, setLoading] = useState(true);
  const [rescuerLocation, setRescuerLocation] = useState<{ lat: number; lng: number; name: string } | undefined>();
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

  const loadPending = async () => {
    try {
      const res = await fetchPendingRequests();
      setPending(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllRequests = async () => {
    try {
      const res = await fetchAllRequests();
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
          <div className="p-3 border-b bg-gray-50 font-semibold">📋 Các ca cứu hộ chưa nhận ({pending.length})</div>
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