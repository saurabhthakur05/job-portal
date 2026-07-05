import Message from '../models/Message.js';
import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { createNotification } from '../utils/notifications.js';
import { AppError } from '../middleware/errorHandler.js';

export const getConversations = async (req, res, next) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user._id }, { receiver: req.user._id }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversation',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', req.user._id] }, { $eq: ['$isRead', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const conversations = await Promise.all(
      messages.map(async (conv) => {
        const otherUserId =
          conv.lastMessage.sender.toString() === req.user._id.toString()
            ? conv.lastMessage.receiver
            : conv.lastMessage.sender;
        const otherUser = await User.findById(otherUserId).select('name avatar role');
        return {
          conversationId: conv._id,
          otherUser,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
        };
      })
    );

    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const conversationId = Message.getConversationId(req.user._id, userId);

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender receiver', 'name avatar')
      .sort('createdAt');

    await Message.updateMany(
      { conversation: conversationId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, messages, conversationId });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, applicationId } = req.body;
    const conversationId = Message.getConversationId(req.user._id, receiverId);

    let fileUrl, fileName;
    if (req.file && process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await uploadToCloudinary(req.file.buffer, 'messages', 'auto');
      fileUrl = result.secure_url;
      fileName = req.file.originalname;
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      receiver: receiverId,
      content: content || '',
      fileUrl,
      fileName,
      application: applicationId,
    });

    await message.populate('sender receiver', 'name avatar');

    const io = req.app.get('io');
    io.to(`user_${receiverId}`).emit('new_message', message);

    await createNotification(io, {
      userId: receiverId,
      type: 'recruiter_message',
      title: 'New Message',
      message: `${req.user.name}: ${content?.slice(0, 50) || 'Sent a file'}`,
      link: `/messages/${req.user._id}`,
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};
