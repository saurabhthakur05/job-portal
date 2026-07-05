import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: String, required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    fileUrl: String,
    fileName: String,
    isRead: { type: Boolean, default: false },
    application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  },
  { timestamps: true }
);

messageSchema.statics.getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

const Message = mongoose.model('Message', messageSchema);
export default Message;
