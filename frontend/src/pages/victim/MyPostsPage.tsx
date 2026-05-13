// src/pages/victim/MyPostsPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import MyPostCard from '../../components/victim/MyPostCard';
import UpdatePostModal from '../../components/victim/UpdatePostModal';
import { GoogleMapsComponent } from '../../components/LeafletComponent';
import ChatWindow from '../../components/chat/ChatWindow';
import toast, { Toaster } from 'react-hot-toast';

const MyPostsPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  // Dữ liệu bản đồ
  const [victimLocation, setVictimLocation] = useState<any>(null);
  const [rescuerLocations, setRescuerLocations] = useState<any[]>([]);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const [activeConversation, setActiveConversation] = useState<any>(null);

  useEffect(() => { 
    fetchMyPosts(); 
  }, []);

  // Lấy lịch sử vị trí Rescuer khi chọn bài đã được nhận
  useEffect(() => {
    if (selectedPost && selectedPost.status !== 'pending') {
      fetchRescuerHistory(selectedPost.id);
      
      // Chỉ polling khi status là 'assigned' (đang hoạt động)
      if (selectedPost.status === 'assigned') {
        const interval = setInterval(() => {
          fetchRescuerHistory(selectedPost.id);
        }, 20000);
        
        setPollingInterval(interval);
        
        return () => {
          if (interval) clearInterval(interval);
        };
      } else {
        // Nếu là completed hoặc cancelled, không polling
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    } else {
      setRescuerLocations([]);
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  }, [selectedPost]);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  useEffect(() => {
    const getConversationByRequest = async () => {
      if (selectedPost && selectedPost.id && selectedPost.status !== 'pending') {
        try {
          setLoadingChat(true);
          const response = await api.get(`/conversations/request/${selectedPost.id}`);
          if (response.data.success) {
            setActiveConversation(response.data.data);
          } else {
            setActiveConversation(null);
          }
        } catch (error) {
          console.error("Lỗi lấy hội thoại:", error);
          setActiveConversation(null);
        } finally {
          setLoadingChat(false);
        }
      } else {
        setActiveConversation(null);
      }
    };
  
    getConversationByRequest();
  }, [selectedPost]);

  const fetchMyPosts = async () => {
    try {
      const response = await api.get('/rescue-posts/my-posts');
      const data = response.data.data;
      setPosts(data);
      if (data.length > 0 && !selectedPost) setSelectedPost(data[0]);
    } catch (err) { 
      toast.error("Lỗi tải danh sách bài viết"); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchRescuerHistory = async (requestId: number) => {
    try {
      const res = await api.get(`/locations/history/${requestId}`);
      // Sắp xếp theo thời gian tăng dần để vẽ đường đi
      const sortedLocations = (res.data || []).sort((a: any, b: any) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      setRescuerLocations(sortedLocations);
    } catch (err) { 
      console.error("Không lấy được vị trí người cứu hộ"); 
    }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("Bạn chắc chắn muốn hủy yêu cầu này?")) return;
    try {
      await api.put(`/rescue-posts/cancel/${id}`);
      toast.success("Đã hủy yêu cầu");
      fetchMyPosts();
    } catch (err) { 
      toast.error("Lỗi khi hủy yêu cầu"); 
    }
  };

  const handleComplete = async (id: number) => {
    if (!window.confirm("Xác nhận hoàn thành yêu cầu này?")) return;
    try {
      await api.put(`/rescue-posts/complete/${id}`);
      toast.success("Yêu cầu đã hoàn thành!");
      fetchMyPosts();
    } catch (err) { 
      toast.error("Lỗi khi cập nhật trạng thái"); 
    }
  };

  const handleUpdateConfirm = async (updateData: any) => {
    try {
      await api.put(`/rescue-posts/update/${selectedPost.id}`, updateData);
      toast.success("Cập nhật thành công");
      setIsUpdateModalOpen(false);
      fetchMyPosts();
    } catch (err) { 
      toast.error("Cập nhật thất bại"); 
    }
  };

  // Chuẩn bị dữ liệu cho bản đồ (bao gồm cả đường đi)
  const getMapData = () => {
    if (!selectedPost) return { incidents: [], route: [] };
    
    // Điểm của nạn nhân
    const victimPoint = {
      id: `victim-${selectedPost.id}`,
      type: 'victim',
      title: selectedPost.title,
      lat: Number(selectedPost.lat),
      lng: Number(selectedPost.lng),
      level: selectedPost.urgency_level as 1 | 2 | 3 | 4 | 5,
      status: 'victim' as 'victim'
    };

    // Các điểm vị trí của rescuer
    const rescuerPoints = rescuerLocations.map((loc, index) => ({
      id: `rescuer-${loc.id || index}`,
      type: 'rescuer',
      title: index === rescuerLocations.length - 1 ? 'Vị trí hiện tại của cứu hộ viên' : `Vị trí lúc ${new Date(loc.created_at).toLocaleTimeString('vi-VN')}`,
      lat: Number(loc.lat),
      lng: Number(loc.lng),
      level: 1 as 1 | 2 | 3 | 4 | 5,
      status: 'rescuer' as 'rescuer',
      timestamp: loc.created_at
    }));

    // Đường đi (các điểm theo thứ tự thời gian)
    const routePoints = rescuerLocations.map(loc => ({
      lat: Number(loc.lat),
      lng: Number(loc.lng)
    }));

    return {
      incidents: [victimPoint, ...rescuerPoints],
      route: routePoints
    };
  };

  const mapData = getMapData();

  return (
    <div className="flex h-screen bg-white">
      <Toaster />
      
      {/* NỬA TRÁI - Danh sách bài đăng */}
      <div className="w-2/5 border-r flex flex-col bg-gray-50">
        <div className="p-4 bg-white border-b font-bold text-red-600 uppercase">
          Yêu cầu của tôi ({posts.length})
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center text-gray-400">Đang tải...</div>
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-400">Bạn chưa có yêu cầu nào</div>
          ) : (
            posts.map(post => (
              <div 
                key={post.id} 
                onClick={() => setSelectedPost(post)} 
                className={`cursor-pointer transition-all ${selectedPost?.id === post.id ? 'ring-2 ring-red-400 rounded-lg' : 'opacity-80 hover:opacity-100'}`}
              >
                <MyPostCard 
                  post={post} 
                  onCancel={handleCancel}
                  onComplete={handleComplete}
                  onUpdate={() => setIsUpdateModalOpen(true)}
                />
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* NỬA PHẢI: BẢN ĐỒ (TRÊN) & CHAT (DƯỚI) */}
      <div className="w-3/5 flex flex-col h-full">
        
        {/* PHẦN TRÊN: BẢN ĐỒ (60%) */}
        <div className="h-[60%] border-b relative bg-slate-100">
          {selectedPost && selectedPost.lat && selectedPost.lng ? (
            <GoogleMapsComponent 
            key={`map-${selectedPost.id}-${rescuerLocations.length}`}
            incidents={mapData.incidents}
            route={mapData.route}
            onIncidentClick={(incident) => console.log('Clicked:', incident)}
          />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 italic bg-gray-100">
              <div className="animate-bounce mb-2">📍</div>
              <p>{loading ? "Đang tải dữ liệu..." : "Vị trí không khả dụng hoặc chưa chọn bài"}</p>
            </div>
          )}
          
          
          {/* Hiển thị thông tin rescuer */}
          {rescuerLocations.length > 0 && (
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md text-xs">
              <span className="font-semibold text-green-600">🚑 Cứu hộ viên:</span>
              <span className="ml-1 text-gray-600">
                {rescuerLocations.length} vị trí đã ghi nhận
              </span>
            </div>
          )}
        </div>

        {/* PHẦN DƯỚI: KHUNG CHAT (40%) */}
        <div className="h-[60%] flex flex-col bg-white overflow-hidden border-t">
          {selectedPost?.status === 'pending' ? (
            /* Trạng thái Đang chờ */
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="text-5xl mb-4 animate-pulse">📡</div>
              <h2 className="text-xl font-bold text-gray-700">Đang tìm người hỗ trợ...</h2>
              <p className="text-sm text-gray-500 mt-2">Hệ thống chat sẽ mở khi có người tiếp nhận.</p>
            </div>
          ) : loadingChat ? (
            /* Đang tải */
            <div className="flex-1 flex items-center justify-center text-gray-400 italic">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mr-2"></div>
              Đang kết nối hội thoại...
            </div>
          ) : activeConversation ? (
            /* Có hội thoại */
            <div className="flex-1 overflow-hidden">
              <ChatWindow 
                key={activeConversation.id}
                conversationId={activeConversation.id}
                conversationTitle={activeConversation.other_user_name}
                conversationAvatar={activeConversation.other_user_avatar}
                conversationPhone={activeConversation.other_user_phone}
              />
            </div>
          ) : selectedPost && selectedPost.status !== 'pending' ? (
            /* Đã nhận nhưng lỗi */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-sm">Không thể kết nối với người dùng này.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 text-xs text-red-500 hover:underline"
              >
                Thử lại
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal cập nhật */}
      {isUpdateModalOpen && (
        <UpdatePostModal 
          post={selectedPost} 
          onClose={() => setIsUpdateModalOpen(false)} 
          onConfirm={handleUpdateConfirm}
        />
      )}
    </div>
  );
};

export default MyPostsPage;