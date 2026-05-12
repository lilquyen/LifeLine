import React from 'react';

const ConversationItem = ({ data, isActive, onClick }: any) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 cursor-pointer transition-all border-l-4
        ${isActive ? 'bg-red-50 border-red-600' : 'hover:bg-gray-50 border-transparent'}`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {data.other_user_avatar ? (
          <img src={data.other_user_avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
            {data.other_user_name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className="text-sm font-bold text-slate-800 truncate">
            {data.other_user_name + " - [" + data.request_title + "]"}
          </h4>
          <span className="text-[10px] text-gray-400">
            {data.last_message_time ? new Date(data.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className={`text-xs truncate flex-1 ${Number(data.unread_count) > 0 ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
            {
              data.last_message === null
                ? "Hãy bắt đầu cuộc hội thoại"
                : data.last_message.trim() === ""
                  ? "Đã gửi hình ảnh"
                  : data.last_message
            }
          </p>
          
          {/* Badge tin nhắn chưa đọc */}
          {Number(data.unread_count) > 0 && (
            <span className="ml-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {data.unread_count}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;