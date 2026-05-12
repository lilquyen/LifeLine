import React from 'react';
import ConversationItem from './ConversationItem';

interface Conversation {
  id: number;
  request_id: number;
  other_user_id: number;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: string;
  request_title: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  loading?: boolean;
  onConversationsUpdate?: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  selectedId, 
  onSelect,
  loading,
  onConversationsUpdate 
}) => {
  
  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-4xl mb-2">📭</div>
        <p className="text-sm text-gray-500 font-medium">Chưa có cuộc hội thoại nào</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          data={conv}
          isActive={selectedId === conv.id}
          onClick={() => onSelect(conv.id)}
        />
      ))}
    </div>
  );
};

export default ConversationList;