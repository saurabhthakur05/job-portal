import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';

const NotificationsPage = () => {
  const { notifications: socketNotifs, markAllRead } = useSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/notifications').then((r) => setNotifications(r.data.notifications));
  }, [socketNotifs]);

  useEffect(() => { markAllRead(); }, [markAllRead]);

  const handleRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="section-title mb-8">Notifications</h1>
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n._id}
            onClick={() => handleRead(n._id)}
            className={`glass-card cursor-pointer ${!n.isRead ? 'border-l-4 border-l-primary-500' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-gray-500 mt-1">{n.message}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{formatDate(n.createdAt)}</span>
            </div>
            {n.link && <Link to={n.link} className="text-sm text-primary-600 mt-2 inline-block hover:underline">View details</Link>}
          </div>
        ))}
        {notifications.length === 0 && <p className="text-center text-gray-500 py-12">No notifications</p>}
      </div>
    </div>
  );
};

export default NotificationsPage;
