import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';

const defaultValue = {
  socket: null,
  notifications: [],
  unreadCount: 0,
  markAllRead: async () => {},
  setUnreadCount: () => {},
};

const SocketContext = createContext(defaultValue);

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const SocketProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?._id) return;

    const newSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    newSocket.emit('join', user._id);
    setSocket(newSocket);

    newSocket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    api.get('/notifications').then((res) => {
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    }).catch(() => {});

    return () => newSocket.close();
  }, [user?._id]);

  const markAllRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAllRead, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
