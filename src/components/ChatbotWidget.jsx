import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  RotateCcw, 
  BookOpen, 
  ExternalLink, 
  AlertCircle,
  ShoppingBag,
  Clock,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';

const QUICK_SUGGESTIONS = [
  { label: '📚 Book Availability', query: 'Is Siddhartha available?' },
  { label: '🛒 How to Order', query: 'How to place an order?' },
  { label: '💳 Payment Options', query: 'What payment methods do you accept?' },
  { label: '📦 Track My Order', query: 'Track my order status' }
];

const INITIAL_MESSAGE = {
  id: 'welcome',
  sender: 'assistant',
  text: "Hello! 👋 Welcome to readaura.lk. I'm your AI assistant. I can help you check book availability, prices, categories, authors, order placement, or your order status. How can I assist you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  data: null
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Auto-scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  // Handle sending a message
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    // Reset error & clear input
    setError(null);
    setInput('');

    const userMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Abort previous in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: query }),
        signal: controller.signal
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Unable to get a response. Please try again.');
      }

      const botMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: data.message,
        source: data.source,
        data: data.data || null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      if (err.name === 'AbortError') return; // User cancelled or resent

      console.error('[Chatbot Error]:', err);
      setError(err.message || 'Something went wrong. Please check your connection and try again.');
      
      const errorMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        isError: true,
        text: "I'm having trouble connecting right now. Please check your internet connection or try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Clear chat conversation
  const handleClearChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([INITIAL_MESSAGE]);
    setError(null);
    setIsLoading(false);
  };

  // Render formatted message content (handling line breaks and bullet points)
  const renderMessageContent = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          // Format bold text **text**
          const formattedParts = line.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-semibold text-white light:text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          });

          return (
            <p key={idx} className="break-words">
              {formattedParts}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed z-50 bottom-20 right-4 sm:bottom-6 sm:right-24">
      {/* Floating Action Button */}
      {!isOpen && (
        <div 
          className="relative flex items-center gap-3"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Tooltip Label */}
          <div className={`px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold border border-white/10 backdrop-blur-md shadow-lg transition-all duration-300 transform origin-right ${
            isHovered ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-95 pointer-events-none'
          } light:bg-white light:text-slate-800 light:border-slate-200`}>
            ReadAura Assistant
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 via-purple-600 to-indigo-600 text-white shadow-3d-glow hover:shadow-3d-glow-hover hover:scale-110 active:scale-95 transition-all duration-300 group"
            aria-label="Open ReadAura Assistant"
          >
            <Bot className="w-7 h-7 transition-transform duration-300 group-hover:rotate-12" />
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-400 border-2 border-slate-950"></span>
            </span>
          </button>
        </div>
      )}

      {/* Expandable Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-[calc(100vw-2rem)] max-w-sm sm:w-96 h-[580px] max-h-[85vh] flex flex-col rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl overflow-hidden light:bg-white/95 light:border-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-slate-950/70 border-b border-slate-800/80 light:bg-slate-50 light:border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md">
                  <Bot className="w-5 h-5" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-wide light:text-slate-900">
                    ReadAura Assistant
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online & Ready
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Clear Chat Button */}
                <button
                  onClick={handleClearChat}
                  title="Reset conversation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors light:text-slate-500 light:hover:text-slate-900 light:hover:bg-slate-100"
                  aria-label="Reset chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors light:text-slate-500 light:hover:text-slate-900 light:hover:bg-slate-100"
                  aria-label="Close assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      isUser
                        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-br-none'
                        : msg.isError
                        ? 'bg-red-950/40 border border-red-800/40 text-red-200 rounded-bl-none'
                        : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-bl-none light:bg-slate-100 light:border-slate-200 light:text-slate-800'
                    }`}>
                      {renderMessageContent(msg.text)}

                      {/* Render Book Cards if matched in response */}
                      {msg.data && Array.isArray(msg.data) && msg.data.length > 0 && (
                        <div className="mt-3 space-y-2 pt-2 border-t border-slate-700/50 light:border-slate-300">
                          {msg.data.map((book, bIdx) => (
                            <div 
                              key={bIdx}
                              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50 hover:border-brand-500/50 transition-all text-xs light:bg-white light:border-slate-200"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-semibold text-slate-100 light:text-slate-900 line-clamp-1">
                                  {book.title}
                                </div>
                                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  book.availabilityStatus === 'In Stock'
                                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                    : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                                }`}>
                                  {book.availabilityStatus}
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-400 light:text-slate-500 mt-0.5">
                                By {book.author}
                              </div>

                              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/50 light:border-slate-100">
                                <span className="font-bold text-brand-400 light:text-brand-600">
                                  Rs. {book.price}
                                </span>

                                <button
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate(`/books/${book.slug}`);
                                  }}
                                  className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                  View Book
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className={`text-[10px] mt-1.5 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loading Dots Indicator */}
              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-bl-none px-4 py-3 light:bg-slate-100 light:border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-2 bg-slate-950/40 border-t border-slate-800/50 overflow-x-auto scrollbar-none flex gap-1.5 light:bg-slate-50 light:border-slate-200">
              {QUICK_SUGGESTIONS.map((sugg, idx) => (
                <button
                  key={idx}
                  disabled={isLoading}
                  onClick={() => handleSendMessage(sugg.query)}
                  className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-brand-600/20 hover:border-brand-500/50 hover:text-brand-300 transition-all disabled:opacity-50 light:bg-white light:border-slate-200 light:text-slate-700 light:hover:bg-brand-50"
                >
                  {sugg.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2 light:bg-slate-50 light:border-slate-200"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about books, orders, delivery..."
                disabled={isLoading}
                className="flex-1 bg-slate-800/70 border border-slate-700/60 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all disabled:opacity-50 light:bg-white light:border-slate-200 light:text-slate-900 light:placeholder-slate-400"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white disabled:opacity-40 hover:scale-105 active:scale-95 transition-all shadow-md"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
