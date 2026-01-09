import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Maximize2, HeadphonesIcon } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';

const AIChatAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', content: string}[]>([
    { role: 'model', content: "Hello! I'm your dedicated 24/7 support agent. How can I help you with your trading or account today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatWithAI(userMsg, messages);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null; // Only for logged in users

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-cnc-500 hover:bg-cnc-600 text-cnc-900 p-4 rounded-full shadow-2xl shadow-cnc-500/20 transition-transform hover:scale-110 flex items-center justify-center group"
        >
          <HeadphonesIcon size={28} />
          <span className="absolute right-full mr-4 bg-cnc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            24/7 Support
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 bg-cnc-800 border border-cnc-700 shadow-2xl transition-all duration-300 overflow-hidden flex flex-col
            ${isMinimized 
              ? 'bottom-6 right-6 w-72 h-14 rounded-t-xl' 
              : 'bottom-0 right-0 w-full md:bottom-6 md:right-6 md:w-96 md:h-[500px] md:rounded-2xl'
            }`}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 bg-cnc-900 border-b border-cnc-700 cursor-pointer"
            onClick={() => setIsMinimized(!isMinimized)}
          >
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="font-bold text-sm">CNC Support (24/7)</span>
             </div>
             <div className="flex items-center gap-2">
               <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="text-gray-500 hover:text-white">
                 {isMinimized ? <Maximize2 size={16}/> : <Minimize2 size={16}/>}
               </button>
               <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-gray-500 hover:text-white">
                 <X size={16}/>
               </button>
             </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cnc-900/50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     {msg.role === 'model' && (
                       <div className="w-6 h-6 rounded-full bg-cnc-700 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                         <Bot size={14} />
                       </div>
                     )}
                     <div 
                       className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                         msg.role === 'user' 
                         ? 'bg-cnc-500 text-cnc-900 rounded-br-sm' 
                         : 'bg-cnc-700 text-gray-200 rounded-bl-sm'
                       }`}
                     >
                       {msg.content}
                     </div>
                  </div>
                ))}
                {loading && (
                   <div className="flex justify-start">
                      <div className="w-6 h-6 rounded-full bg-cnc-700 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                         <Bot size={14} />
                       </div>
                      <div className="bg-cnc-700 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                      </div>
                   </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 bg-cnc-900 border-t border-cnc-700">
                 <div className="relative">
                   <textarea 
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     onKeyDown={handleKeyDown}
                     placeholder="Type your question..."
                     rows={1}
                     className="w-full bg-cnc-800 border border-cnc-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:border-cnc-500 outline-none resize-none scrollbar-hide"
                   />
                   <button 
                     onClick={handleSend}
                     disabled={!input.trim() || loading}
                     className="absolute right-2 top-2 p-1.5 bg-cnc-500 rounded-lg text-cnc-900 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <Send size={16} />
                   </button>
                 </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;