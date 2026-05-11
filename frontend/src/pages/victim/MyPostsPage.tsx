import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import MyPostCard from '../../components/victim/MyPostCard';
import { GoogleMapsComponent } from '../../components/LeafletComponent';

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

  useEffect(() => {
    fetchMyPosts();
  }, []);

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
          <div className="h-1/2 border-b relative bg-slate-100">
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

        {/* PHẦN DƯỚI: KHUNG CHAT (TẠM ĐỂ TRỐNG) */}
        <div className="h-1/2 flex flex-col bg-white">
          {selectedPost?.status === 'pending' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-pulse">
              <div className="text-5xl mb-4">📡</div>
              <h2 className="text-xl font-bold text-gray-700">Đang tìm người hỗ trợ...</h2>
              <p className="text-gray-500 mt-2">Vị trí của bạn đang được ưu tiên hiển thị cho các đội cứu hộ gần nhất.</p>
            </div>
          ) : selectedPost ? (
            <div className="flex-1 flex flex-col overflow-hidden">
               {/* Header Chat */}
               <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                      H
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">Cứu hộ viên hỗ trợ</div>
                      <div className="text-xs text-green-500 font-medium italic">Vừa mới hoạt động</div>
                    </div>
                  </div>
               </div>

               {/* Vùng tin nhắn */}
               <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50 p-4">
                  <div className="flex justify-center">
                    <span className="bg-white px-3 py-1 rounded-full text-[10px] text-gray-400 border shadow-sm uppercase font-bold">
                      Bắt đầu cuộc trò chuyện
                    </span>
                  </div>
               </div>

               {/* Input Chat (Tạm thời) */}
               <div className="p-4 border-t bg-white flex gap-2">
                  <input 
                    disabled
                    type="text" 
                    placeholder="Tính năng chat đang được cập nhật..." 
                    className="flex-1 border border-gray-200 rounded-full px-5 py-2 bg-gray-50 text-sm italic"
                  />
                  <button className="bg-gray-300 text-white p-2 rounded-full w-10 h-10 cursor-not-allowed">
                    ➤
                  </button>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
               Chọn bài đăng để kết nối liên lạc
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPostsPage;