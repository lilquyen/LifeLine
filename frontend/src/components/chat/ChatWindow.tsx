import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import useAuthStore from '../../stores/authStore';

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  sent_at: string;
  istext: boolean;
  image_urls: string[];
  sender_name: string;
  is_read: boolean;
}

interface ChatWindowProps {
  conversationId: number;
  onMessagesRead?: () => void; 
  onMessageSent?: () => void;
  conversationTitle?: string;
  conversationAvatar?: string;
  conversationPhone?: string;
}

const ChatWindow = ({ conversationId, onMessagesRead, onMessageSent, conversationTitle, conversationAvatar, conversationPhone }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUserId = useAuthStore((state) => state.user?.id);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversationId) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/chat/${conversationId}/messages`);
        await markMessegesAsRead(); 
        setMessages(response.data);
      } catch (error) {
        console.error("Lỗi fetch tin nhắn:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendText = async (text: string) => {
    try {
      setIsSending(true);
      const res = await api.post(`/chat/${conversationId}/messages/text`, { 
        content: text,
        type: 'text'
      });
      
      if (res.data) {
        setMessages(prev => [...prev, res.data]);
        onMessageSent?.();
      }
    } catch (error) {
      console.error("Gửi tin nhắn thất bại:", error);
      alert('Gửi tin nhắn thất bại');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendImage = async (files: File[]) => {
    if (!files.length) return;
    
    const previewUrls: string[] = [];
    
    try {
      setIsSending(true);
      
      for (const file of files) {
        const previewUrl = URL.createObjectURL(file);
        previewUrls.push(previewUrl); 
      };
        
        const tempMessage: Message = {
          id: Date.now(),
          conversation_id: conversationId,
          sender_id: currentUserId || 0,
          content: '',
          sent_at: new Date().toISOString(),
          istext: false,
          image_urls: previewUrls, // GỘP TẤT CẢ ẢNH VÀO 1 MẢNG
          is_read: false,
          sender_name: ''
        };
        setMessages(prev => [...prev, tempMessage]);
      
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`images`, file);
      });
      formData.append('conversation_id', conversationId.toString());
      
      const res = await api.post(`/chat/${conversationId}/messages/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (res.data) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? res.data : msg
        ));
      }
      
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      onMessageSent?.();
      
    } catch (error) {
      console.error("Gửi ảnh thất bại:", error);
      setMessages(prev => prev.filter(msg => msg.image_urls !== previewUrls));
      alert('Gửi ảnh thất bại, vui lòng thử lại');
    } finally {
      setIsSending(false);
    }
  };

  const markMessegesAsRead = async () => {
    try {
      await api.patch(`/chat/${conversationId}/messages/read`);

      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.sender_id !== currentUserId 
            ? { ...msg, is_read: true }
            : msg
        )
      );

      if (onMessagesRead) {
        onMessagesRead();
      }

    } catch (error) {
      console.error("Đánh dấu đã đọc thất bại:", error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between bg-white flex-none">
        {/* Cụm bên trái: Avatar + Tên */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            {conversationAvatar ? (
              <img src={conversationAvatar} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
                {conversationTitle?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div>
            <div className="font-bold text-slate-800 leading-tight">
              {conversationTitle}
            </div>
          </div>
        </div>

        {/* Cụm bên phải: Ô Số điện thoại nổi bật */}
        {conversationPhone && (
          <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl border border-red-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Số điện thoại liên hệ</span>
              <a 
                href={`tel:${conversationPhone}`} 
                className="text-sm md:text-base font-black text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                {conversationPhone}
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Danh sách tin nhắn */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f0f2f5] custom-scrollbar"
      >
        {loading ? (
          <div className="text-center text-gray-400 text-sm italic">
            Đang tải tin nhắn...
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <MessageBubble 
              key={msg.id}
              content={msg.content}
              isMine={msg.sender_id === currentUserId}
              timestamp={msg.sent_at}
              istext={msg.istext}
              image_urls={msg.image_urls || []}
            />
          ))
        ) : (
          <div className="text-center text-gray-400 text-sm mt-10">
            Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-none">
        <MessageInput 
          onSend={handleSendText}
          onSendImage={handleSendImage}
          disabled={false}
          isSending={isSending}
        />
      </div>
    </div>
  );
};

export default ChatWindow;