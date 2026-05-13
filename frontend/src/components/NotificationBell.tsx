import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../services/api';
import { connectSocket } from '../services/socket';

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  content: string;
  ref_id: number | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadLabel = useMemo(() => {
    if (unreadCount > 9) return '9+';
    return unreadCount.toString();
  }, [unreadCount]);

  const fetchNotifications = async () => {
    const res = await api.get('/notifications/my');
    const data = res.data.data;
    setItems(data.items || []);
    setUnreadCount(data.unreadCount || 0);
  };

  useEffect(() => {
    fetchNotifications().catch(console.error);

    const socket = connectSocket();
    socket?.on('new_notification', (notification: NotificationItem) => {
      setItems(prev => [notification, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket?.off('new_notification');
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    await api.patch('/notifications/read-all');
    setItems(prev => prev.map(item => ({ ...item, is_read: true })));
    setUnreadCount(0);
  };

  const markAsRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
    setItems(prev => prev.map(item => item.id === id ? { ...item, is_read: true } : item));
    setUnreadCount(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition"
        aria-label="Thông báo"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
            {unreadLabel}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-lg shadow-xl z-[1200] overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Thông báo</h3>
              <p className="text-xs text-slate-500">{unreadCount} chưa đọc</p>
            </div>
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
            >
              <CheckCheck size={15} />
              Đọc tất cả
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                Chưa có thông báo nào
              </div>
            ) : (
              items.map(item => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => !item.is_read && markAsRead(item.id)}
                  className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-slate-50 ${
                    item.is_read ? 'bg-white' : 'bg-red-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{item.title}</p>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{item.content}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(item.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    {!item.is_read && <span className="w-2 h-2 rounded-full bg-red-600 mt-1 flex-none" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
