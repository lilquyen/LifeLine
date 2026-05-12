import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { AssignmentCard } from '../../components/rescuer/AssignmentCard';
import { fetchAllRequests, fetchMyAssignments, getConversationByRequest } from '../../services/rescuerApi';
import { RequestDetail } from '../../components/rescuer/RequestDetail'; // Đổi tên import
import { useNavigate } from 'react-router-dom';

export default function RescuerAssignments() {
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [myAssignments, setMyAssignments] = useState<any[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingMine, setLoadingMine] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadAllRequests();
    loadMyAssignments();
  }, []);

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Quản lý ca cứu hộ</h1>
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tất cả các ca</TabsTrigger>
          <TabsTrigger value="mine">Ca của tôi</TabsTrigger>
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

        <TabsContent value="mine">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingMine ? (
              <div>Đang tải...</div>
            ) : myAssignments.length === 0 ? (
              <div>Bạn chưa nhận ca nào</div>
            ) : (
              myAssignments.map((assign) => (
                <AssignmentCard
                  key={assign.assignment_id}
                  assignment={assign}
                  onMessage={handleMessage}
                  onViewDetail={handleViewDetail}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Chỉ hiển thị modal khi có requestId */}
      {selectedRequestId !== null && (
        <RequestDetail 
          requestId={selectedRequestId} 
          onClose={() => {
            console.log("Closing modal"); // THÊM LOG
            setSelectedRequestId(null);
          }} 
        />
      )}
    </div>
  );
}