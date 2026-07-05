import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import api from '../../services/api';

const CareerChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your AI Career Assistant. Ask me about resumes, interviews, skills, or career advice!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(['Resume tips', 'Interview prep', 'Skill recommendations']);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/admin/ai/chat', { message: text });
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      setSuggestions(data.suggestions || []);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, I could not process that. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Career Assistant"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] glass-card flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="font-bold">AI Career Assistant</h3>
              <p className="text-xs text-gray-500">Career guidance & interview prep</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && <div className="text-sm text-gray-400">Thinking...</div>}
            </div>
            {suggestions.length > 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)} className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 hover:bg-primary-200 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 flex gap-2">
              <input className="input-field flex-1 text-sm py-2" placeholder="Ask me anything..." value={input} onChange={(e) => setInput(e.target.value)} />
              <button type="submit" className="btn-primary px-3 py-2"><Send className="w-4 h-4" /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CareerChatbot;
