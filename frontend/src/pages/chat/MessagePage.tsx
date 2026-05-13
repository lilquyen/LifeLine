import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import { ref } from 'process';
import { useParams } from 'react-router-dom';

// Khai báo Interface để khớp với dữ liệu từ Backend
interface Conversation {
  id: number;
  request_id: number;
  other_user_id: number;
  other_user_name: string;
  other_user_avatar: string | null;
  other_user_phone: string | null;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: string;
  request_title: string;
}

const MessagesPage = () => {
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [selectedPhone, setSelectedPhone] = useState<string>('');
  const [conversationTitle, setConversationTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0); 

  // Hàm fetch danh sách hội thoại
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/conversations/my');
      if (response.data.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách hội thoại:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Fetch danh sách hội thoại từ API
  useEffect(() => {
    fetchConversations();
  }, [refreshKey]); 

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const id = parseInt(conversationId);
      const conversation = conversations.find(conv => conv.id === id);
      
      if (conversation) {
        setSelectedId(id);
        setSelectedAvatar(conversation.other_user_avatar || '');
        setConversationTitle(conversation.other_user_name + " [" + conversation.request_title + "]");
        setSelectedPhone(conversation.other_user_phone || '');
      }
    }
  }, [conversationId, conversations]);

  const handleSelectConversation = async (id: number) => {
    setSelectedId(id);
    for (let conv of conversations) {
      if (conv.id === id) {
        setSelectedAvatar(conv.other_user_avatar || '');
        setConversationTitle(conv.other_user_name + " [" + conv.request_title + "]");
        setSelectedPhone(conv.other_user_phone || '');
        break;
      }
    }
    await fetchConversations(); // Cập nhật lại danh sách hội thoại để lấy số lượng tin nhắn chưa đọc mới nhất
  };

  const refreshConversations = () => {
    setRefreshKey(prev => prev + 1); // Thay đổi refreshKey để kích hoạt useEffect và fetch lại hội thoại
  }

  // 2. Logic tìm kiếm hội thoại theo tên người dùng
  const filteredConversations = conversations.filter(conv =>
    conv.other_user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full w-full bg-white overflow-hidden shadow-inner">
      {/* --- CỘT TRÁI: DANH SÁCH HỘI THOẠI --- */}
      <div className="w-80 md:w-96 border-r flex flex-col bg-white">
        {/* Header tìm kiếm */}
        <div className="p-4 bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Đoạn chat</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm kiếm cuộc hội thoại..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 ring-red-500/20 transition-all border border-transparent focus:bg-white focus:border-red-500"
            />
          </div>
        </div>
        
        {/* Danh sách cuộn */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ConversationList 
            loading={loading}
            conversations={filteredConversations} 
            selectedId={selectedId} 
            onSelect={handleSelectConversation} 
          />
        </div>
      </div>

      {/* --- CỘT PHẢI: CHI TIẾT NỘI DUNG CHAT --- */}
      <div className="flex-1 flex flex-col bg-gray-50 relative">
        {selectedId ? (
          <ChatWindow 
            key={selectedId} // Key giúp reset ChatWindow khi đổi hội thoại
            conversationId={selectedId} 
            onMessagesRead={refreshConversations}
            onMessageSent={refreshConversations}
            conversationAvatar={selectedAvatar}
            conversationTitle={conversationTitle}
            conversationPhone={selectedPhone}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
               <span className="text-5xl animate-bounce">💬</span>
            </div>
            <h3 className="text-xl font-bold text-slate-700">Chưa có cuộc hội thoại nào được chọn</h3>
            <p className="max-w-xs mt-2 text-sm text-gray-500 leading-relaxed">
              Chọn một người từ danh sách bên trái để bắt đầu nhắn tin hỗ trợ hoặc trao đổi thông tin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;