import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import MyPostCard from '../../components/victim/MyPostCard';
import { GoogleMapsComponent } from '../../components/LeafletComponent';
import ChatWindow from '../../components/chat/ChatWindow';

// 1. Định nghĩa Interface cho Incident trên bản đồ
export interface IncidentMapItem {
  id: string;
  type: string;
  level: 1 | 2 | 3 | 4 | 5;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: 'active' | 'resolved';
}

const MyPostsPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 2. State dành riêng cho bản đồ để đảm bảo không truyền NaN
  const [mapAssets, setMapAssets] = useState<any[]>([]);
  const [mapIncidents, setMapIncidents] = useState<IncidentMapItem[]>([]);

  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [loadingChat, setLoadingChat] = useState(false);

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

  // 3. Cập nhật mapIncidents mỗi khi selectedPost thay đổi
  useEffect(() => {
    if (selectedPost && selectedPost.lat && selectedPost.lng) {
      const mapped: IncidentMapItem = {
        id: selectedPost.id.toString(),
        type: selectedPost.title || 'Yêu cầu cứu hộ',
        level: Number(selectedPost.urgency_level) as 1 | 2 | 3 | 4 | 5 || 2,
        location: selectedPost.address || 'Chưa xác định',
        lat: Number(selectedPost.lat) || 10.7769, // Ép kiểu số cực kỳ quan trọng
        lng: Number(selectedPost.lng) || 106.7009,
        timestamp: new Date(selectedPost.created_at).toLocaleString('vi-VN'),
        status: selectedPost.status === 'pending' ? 'active' : 'resolved'
      };
      setMapIncidents([mapped]);


    } else {
      setMapIncidents([]);
    }
  }, [selectedPost]);

  const fetchMyPosts = async () => {
    try {
      const response = await api.get('/rescue-posts/my-posts');
      const dbData = response.data.data;
  
      if (Array.isArray(dbData) && dbData.length > 0) {
        setPosts(dbData);
        
        // Chọn bài đầu tiên ngay lập tức
        const firstPost = dbData[0];
        setSelectedPost(firstPost);

        console.log("Dữ liệu bài đăng đầu tiên:", firstPost);
  
        // "Mồi" dữ liệu bản đồ ngay tại đây để tránh chờ useEffect
        if (firstPost.lat && firstPost.lng) {
          setMapIncidents([{
            id: firstPost.id.toString(),
            type: firstPost.title,
            level: Number(firstPost.urgency_level) as 1|2|3|4|5,
            location: firstPost.address,
            lat: Number(firstPost.lat),
            lng: Number(firstPost.lng),
            timestamp: new Date(firstPost.created_at).toLocaleString('vi-VN'),
            status: 'active'
          }]);
        }
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-red-600">Đang tải dữ liệu...</div>;

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      
      {/* NỬA TRÁI: DANH SÁCH BÀI VIẾT (40%) */}
      <div className="w-2/5 border-r flex flex-col h-full bg-gray-50 shadow-inner">
        <div className="p-5 bg-white border-b">
          <h1 className="text-xl font-black text-red-600 uppercase tracking-tight">
            Yêu cầu của tôi ({posts.length})
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div 
                key={post.id} 
                onClick={() => setSelectedPost(post)}
                className={`transition-all duration-300 transform ${
                  selectedPost?.id === post.id 
                  ? 'scale-[1.02] ring-2 ring-red-500 rounded-lg shadow-lg' 
                  : 'hover:scale-[1.01]'
                }`}
              >
                <MyPostCard post={post} />
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-400">Bạn chưa có bài đăng nào</div>
          )}
        </div>
      </div>

      {/* NỬA PHẢI: BẢN ĐỒ (TRÊN) & CHAT (DƯỚI) (60%) */}
      <div className="w-3/5 flex flex-col h-full">
        
        {/* PHẦN TRÊN: BẢN ĐỒ */}
          <div className="flex-[4] relative bg-slate-100">
            {/* Kiểm tra trực tiếp selectedPost có tọa độ không */}
            {selectedPost && selectedPost.lat && selectedPost.lng ? (
              <GoogleMapsComponent 
                // KEY QUAN TRỌNG: Buộc bản đồ vẽ lại khi đổi bài
                key={`map-${selectedPost.id}`} 
                assets={mapAssets} // mapAssets khai báo là [] ở trên
                incidents={mapIncidents} 
                onIncidentClick={() => {}} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 italic bg-gray-100">
                <div className="animate-bounce mb-2">📍</div>
                <p>{loading ? "Đang tải dữ liệu..." : "Vị trí không khả dụng hoặc chưa chọn bài"}</p>
              </div>
            )}
            
            {/* Badge trạng thái */}
            {selectedPost && (
              <div className="absolute top-4 right-4 z-[1000] bg-white px-4 py-2 rounded-full shadow-md border border-red-100 font-bold">
                {selectedPost.status.toUpperCase()}
              </div>
            )}
          </div>

        {/* PHẦN DƯỚI: KHUNG CHAT */}
        <div className="h-1/2 flex flex-col bg-white overflow-hidden border-t">
          {selectedPost?.status === 'pending' ? (
            /* 1. Trạng thái Đang chờ (Chưa có ai nhận) */
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="text-5xl mb-4 animate-bounce">📡</div>
              <h2 className="text-xl font-bold text-gray-700">Đang tìm người hỗ trợ...</h2>
              <p className="text-sm text-gray-500 mt-2">Hệ thống chat sẽ mở khi có người tiếp nhận.</p>
            </div>
          ) : loadingChat ? (
            /* 2. Trạng thái đang tải dữ liệu hội thoại */
            <div className="flex-1 flex items-center justify-center text-gray-400 italic">
              Đang kết nối hội thoại...
            </div>
          ) : activeConversation ? (
            /* 3. Đã tìm thấy hội thoại -> Hiển thị ChatWindow */
            <div className="flex-1 overflow-hidden">
              <ChatWindow 
                key={activeConversation.id} // Dùng ID của hội thoại làm key
                conversationId={activeConversation.id}
                conversationTitle={activeConversation.other_user_name}
                conversationAvatar={activeConversation.other_user_avatar}
                conversationPhone={activeConversation.other_user_phone}
              />
            </div>
          ) : selectedPost ? (
            /* 4. Đã nhận nhưng không lấy được hội thoại (Lỗi hoặc chưa khởi tạo) */
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
              <p className="text-sm">Không thể kết nối với người dùng này.</p>
            </div>
          ) : (
            /* 5. Chưa chọn bài đăng nào */
            <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
              Chọn một yêu cầu để xem tin nhắn
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPostsPage;