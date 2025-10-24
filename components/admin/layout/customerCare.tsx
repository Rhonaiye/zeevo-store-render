'use client';
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { Search, Send, Users, MessageCircle, Clock, Menu, X, Paperclip } from "lucide-react";

interface Conversation {
  _id: string;
  name: string;
  lastMessageAt: string;
}

interface Message {
  _id: string;
  conversationId: string;
  sender: "user" | "admin";
  content: string;
  timestamp: string;
}

const socket: Socket = io(process.env.NEXT_PUBLIC_API_BASE_URL); // replace with your server URL

const AdminCustomerCare: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [userTyping, setUserTyping] = useState(false);
  const [unreadConversations, setUnreadConversations] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getLinkText = (url: string): string => {
    try {
      const u = new URL(url);
      const filename = u.pathname.split('/').pop();
      if (filename && filename !== '') {
        return decodeURIComponent(filename);
      } else {
        return u.hostname;
      }
    } catch {
      return url;
    }
  };

  const isImageUrl = (url: string): boolean => {
    try {
      return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(new URL(url).pathname.toLowerCase());
    } catch {
      return false;
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const handleReceiveMessage = (msg: Message) => {
      if (msg.sender === "admin") return;

      if (activeConvo && msg.conversationId === activeConvo._id) {
        setMessages((prev) => {
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      } else {
        setUnreadConversations((prev) => ({ ...prev, [msg.conversationId]: true }));
      }
    };

    const handleTyping = ({ sender, conversationId }: { sender: "user" | "admin"; conversationId: string }) => {
      if (!activeConvo || conversationId !== activeConvo._id) return;
      if (sender === "user") {
        setUserTyping(true);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setUserTyping(false), 3000);
      }
    };

    const handleNewConversation = (convo: Conversation) => {
      setConversations((prev) => {
        if (prev.find((c) => c._id === convo._id)) return prev;
        setUnreadConversations((prevUnread) => ({ ...prevUnread, [convo._id]: true }));
        return [convo, ...prev];
      });
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("new_conversation", handleNewConversation);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("new_conversation", handleNewConversation);
    };
  }, [activeConvo]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/conversations`);
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openConversation = async (convo: Conversation) => {
    setActiveConvo(convo);
    setSidebarOpen(false);
    socket.emit("join_conversation", { conversationId: convo._id, name: "admin" });

    // Clear unread badge
    setUnreadConversations((prev) => {
      const copy = { ...prev };
      delete copy[convo._id];
      return copy;
    });

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/conversations/${convo._id}/messages`);
      setMessages(res.data);
      scrollToBottom();
    } catch {
      setMessages([]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert(`File size too large. Maximum size allowed is 5MB.`);
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
      e.target.value = '';
    }
  };

  const sendMessage = async () => {
    if (!activeConvo) return;

    const timestamp = new Date().toISOString();

    if (input.trim()) {
      const msg: Message = {
        _id: Date.now().toString(),
        conversationId: activeConvo._id,
        sender: "admin",
        content: input,
        timestamp,
      };

      socket.emit("send_message", msg);
      setMessages((prev) => [...prev, msg]);
      setInput("");
    }

    if (selectedFile) {
      const optId = `opt-${Date.now()}`;
      const optMsg: Message = {
        _id: optId,
        conversationId: activeConvo._id,
        sender: "admin",
        content: `Sending file: ${selectedFile.name}`,
        timestamp,
      };
      setMessages((prev) => [...prev, optMsg]);

      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/upload/cloudfare`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data.fileurl) {
          const fileMsgId = Date.now().toString() + Math.random();
          const fileMsg: Message = {
            _id: fileMsgId,
            conversationId: activeConvo._id,
            sender: "admin",
            content: res.data.fileurl,
            timestamp,
          };

          socket.emit("send_message", fileMsg);
          setMessages((prev) =>
            prev.map((m) => (m._id === optId ? fileMsg : m))
          );
        } else {
          setMessages((prev) => prev.filter((m) => m._id !== optId));
        }
      } catch (err) {
        console.error('File upload error:', err);
        setMessages((prev) => prev.filter((m) => m._id !== optId));
      }

      setSelectedFile(null);
    }

    scrollToBottom();
  };

  const handleTypingInput = () => {
    if (activeConvo) {
      socket.emit("typing", { sender: "admin", conversationId: activeConvo._id });
    }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const filteredConversations = conversations.filter(convo =>
    convo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = Object.keys(unreadConversations).length;

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:relative z-50 w-80 bg-white shadow-xl flex flex-col border-r border-gray-200 max-h-screen overflow-hidden transition-transform duration-300 ease-in-out`}>
        {/* Header */}
        <div className="p-5 bg-black text-white flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold">Customer Care</h1>
                <p className="text-xs text-gray-400">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <div className="bg-white text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">{unreadCount}</div>
              )}
              <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 hover:bg-white/10 rounded transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="flex justify-center items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
              </div>
              <p className="text-xs mt-2">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((convo) => (
              <div key={convo._id} onClick={() => openConversation(convo)}
                className={`p-3 cursor-pointer transition-all border-l-4 ${activeConvo?._id === convo._id ? "bg-gray-100 border-black" : "border-transparent hover:bg-gray-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs ${unreadConversations[convo._id] ? "bg-black" : "bg-gray-400"}`}>
                      {convo.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900">{convo.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTime(convo.lastMessageAt)}
                      </div>
                    </div>
                  </div>
                  {unreadConversations[convo._id] && <div className="w-2.5 h-2.5 rounded-full bg-black"></div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!activeConvo ? 'hidden md:flex' : 'flex'} flex-1 flex-col max-h-screen overflow-hidden`}>
        {activeConvo ? (
          <>
            {/* Chat Header */}
            <div className="bg-white shadow-sm p-4 border-b border-gray-200 flex-shrink-0 flex items-center gap-2.5">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden mr-2 p-1.5 hover:bg-gray-100 rounded-lg transition-all">
                <Menu className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">{activeConvo.name.charAt(0).toUpperCase()}</div>
              <div>
                <h2 className="font-bold text-sm text-gray-900">{activeConvo.name}</h2>
                <p className="text-xs text-gray-500">Active now</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-3 bg-gray-50">
              {messages.map((msg) => (
                <div key={msg._id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"} animate-fadeIn`}>
                  <div className={`max-w-md ${msg.sender === "admin" ? "order-2" : "order-1"}`}>
                    <div className={`px-3.5 py-2.5 rounded-2xl shadow-sm ${msg.sender === "admin" ? "bg-black text-white rounded-br-sm" : "bg-white text-gray-900 rounded-bl-sm border border-gray-200"}`}>
                      {msg.content.startsWith('http') ? (
                        isImageUrl(msg.content) ? (
                          <img 
                            src={msg.content} 
                            alt="Attached file" 
                            className="max-w-full h-auto rounded-lg" 
                          />
                        ) : (
                          <a 
                            href={msg.content} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`break-words ${msg.sender === "admin" ? "text-blue-300 hover:text-blue-200" : "text-blue-500 hover:text-blue-600"}`}
                          >
                            📎 {getLinkText(msg.content)}
                          </a>
                        )
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                    <p className={`text-xs text-gray-400 mt-1 ${msg.sender === "admin" ? "text-right" : "text-left"}`}>{formatMessageTime(msg.timestamp)}</p>
                  </div>
                </div>
              ))}
              {userTyping && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                  </div>
                  <span className="text-xs">User is typing</span>
                </div>
              )}
              <div ref={messagesEndRef}></div>
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-gray-200 shadow-lg flex-shrink-0 flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileSelect}
                accept="*/*"
              />
              <Paperclip 
                size={20} 
                onClick={() => fileInputRef.current?.click()} 
                className={`cursor-pointer ${selectedFile ? "text-black" : "text-gray-400"}`} 
              />
              <input
                value={input}
                onChange={(e) => { setInput(e.target.value); handleTypingInput(); }}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={selectedFile ? `Send "${selectedFile.name}"` : "Type your message..."}
                className="flex-1 px-4 py-2.5 rounded-full border-2 border-gray-200 focus:border-black focus:outline-none transition-all bg-gray-50 text-base"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() && !selectedFile}
                className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-black"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-5 bg-black rounded-full flex items-center justify-center shadow-xl">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Customer Care</h2>
              <p className="text-sm text-gray-500">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .delay-150 { animation-delay: 0.15s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};

export default AdminCustomerCare;