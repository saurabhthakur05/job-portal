import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { Send } from 'lucide-react';
import api from '../../services/api';
import { getInitials } from '../../utils/helpers';

const MessagesPage = () => {
  const { userId } = useParams();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    api.get('/messages/conversations').then((r) => setConversations(r.data.conversations));
  }, []);

  useEffect(() => {
    if (userId) {
      api.get(`/messages/${userId}`).then((r) => {
        setMessages(r.data.messages);
        const conv = conversations.find((c) => c.otherUser?._id === userId);
        setActiveUser(conv?.otherUser || { _id: userId });
      });
    }
  }, [userId, conversations]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg.sender?._id === activeUser?._id || msg.receiver?._id === activeUser?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on('new_message', handler);
    return () => socket.off('new_message', handler);
  }, [socket, activeUser]);

  const selectConversation = async (conv) => {
    setActiveUser(conv.otherUser);
    const { data } = await api.get(`/messages/${conv.otherUser._id}`);
    setMessages(data.messages);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeUser) return;
    const { data } = await api.post('/messages', { receiverId: activeUser._id, content: newMessage });
    setMessages((prev) => [...prev, data.message]);
    setNewMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="section-title mb-8">Messages</h1>
      <div className="glass-card flex h-[calc(100vh-16rem)] overflow-hidden">
        <div className="w-80 border-r border-gray-200/50 dark:border-gray-700/50 overflow-y-auto shrink-0">
          {conversations.map((conv) => (
            <button
              key={conv.conversationId}
              onClick={() => selectConversation(conv)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${activeUser?._id === conv.otherUser?._id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
                {conv.otherUser?.avatar ? <img src={conv.otherUser.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(conv.otherUser?.name)}
              </div>
              <div className="text-left min-w-0 flex-1">
                <p className="font-medium truncate">{conv.otherUser?.name}</p>
                <p className="text-xs text-gray-500 truncate">{conv.lastMessage?.content}</p>
              </div>
              {conv.unreadCount > 0 && <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">{conv.unreadCount}</span>}
            </button>
          ))}
          {conversations.length === 0 && <p className="text-gray-500 text-center py-8 text-sm">No conversations yet</p>}
        </div>

        <div className="flex-1 flex flex-col">
          {activeUser ? (
            <>
              <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 font-medium">{activeUser.name}</div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg._id} className={`flex ${msg.sender?._id === activeUser._id ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${msg.sender?._id === activeUser._id ? 'bg-gray-100 dark:bg-gray-800' : 'bg-primary-500 text-white'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 flex gap-2">
                <input className="input-field flex-1" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                <button type="submit" className="btn-primary px-4"><Send className="w-4 h-4" /></button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">Select a conversation</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
