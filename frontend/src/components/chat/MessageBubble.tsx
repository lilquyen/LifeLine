import React, { useState } from 'react';

interface MessageBubbleProps {
  content: string;
  isMine: boolean;
  timestamp: string;
  istext?: boolean;  // Thay đổi: từ isImage sang istext
  image_urls?: string[];  // Thay đổi: từ imageUrl sang image_urls (mảng)
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  content, 
  isMine, 
  timestamp, 
  istext = true,  // Mặc định là text message
  image_urls = [] 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (msgDate.getTime() === today.getTime()) {
      return formatTime(dateString);
    } else {
      return date.toLocaleDateString('vi-VN') + ' ' + formatTime(dateString);
    }
  };

  // Nếu là tin nhắn ảnh
  if (!istext && image_urls.length > 0) {
    return (
      <>
        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[70%] ${isMine ? 'bg-red-600 text-white' : 'bg-white text-gray-800'} rounded-2xl px-4 py-2 shadow-sm`}>
            <div className="mb-1">
              {image_urls.length === 1 ? (
                // Một ảnh
                <img 
                  src={image_urls[0]} 
                  alt="Message attachment" 
                  className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition"
                  onClick={() => setSelectedImage(image_urls[0])}
                />
              ) : (
                // Nhiều ảnh - hiển thị dạng grid
                <div className={`grid gap-1 ${image_urls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                  {image_urls.slice(0, 4).map((url, index) => (
                    <img 
                      key={index}
                      src={url} 
                      alt={`Attachment ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                      onClick={() => setSelectedImage(url)}
                    />
                  ))}
                  {image_urls.length > 4 && (
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => setSelectedImage(image_urls[4])}
                    >
                      <img 
                        src={image_urls[4]} 
                        alt="More" 
                        className="w-full h-32 object-cover rounded-lg opacity-70"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        +{image_urls.length - 4}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className={`text-xs mt-1 ${isMine ? 'text-red-100' : 'text-gray-400'}`}>
              {formatDate(timestamp)}
            </div>
          </div>
        </div>

        {/* Modal xem ảnh lớn */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <img 
              src={selectedImage} 
              alt="Full size" 
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
            <button 
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition"
              onClick={() => setSelectedImage(null)}
            >
              
            </button>
          </div>
        )}
      </>
    );
  }

  // Tin nhắn text
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isMine ? 'bg-red-600 text-white' : 'bg-white text-gray-800'} rounded-2xl px-4 py-2 shadow-sm`}>
        <div className="text-sm break-words whitespace-pre-wrap">{content}</div>
        <div className={`text-xs mt-1 ${isMine ? 'text-red-100' : 'text-gray-400'}`}>
          {formatDate(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;