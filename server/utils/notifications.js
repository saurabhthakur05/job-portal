import Notification from '../models/Notification.js';

export const createNotification = async (io, { userId, type, title, message, link, data }) => {
  const notification = await Notification.create({
    user: userId,
    type,
    title,
    message,
    link,
    data,
  });

  if (io) {
    io.to(`user_${userId}`).emit('notification', notification);
  }

  return notification;
};
