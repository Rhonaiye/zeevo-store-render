'use client';
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { Search, Send, Users, MessageCircle, Clock, Menu, X } from "lucide-react";

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

const socket: Socket = io("http://localhost:4000"); // replace with your server URL

const AdminCustomerCare: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [userTyping, setUserTyping] = useState(false);
  const [unreadConversations, setUnreadConversations] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
      const res = await axios.get("http://localhost:4000/api/conversations");
      setConversations(res.data);
    } catch (err) {
      console.error(err);
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
      const res = await axios.get(`http://localhost:4000/api/conversations/${convo._id}/messages`);
      setMessages(res.data);
      scrollToBottom();
    } catch {
      setMessages([]);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !activeConvo) return;

    const msg: Message = {
      _id: Date.now().toString(),
      conversationId: activeConvo._id,
      sender: "admin",
      content: input,
      timestamp: new Date().toISOString(),
    };

    socket.emit("send_message", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
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
      } md:translate-x-0 fixed md:relative z-50 w-80 bg-white shadow-xl flex-col border-r border-gray-200 max-h-screen overflow-hidden transition-transform duration-300 ease-in-out flex`}>
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
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No conversations found</p>
            </div>
          ) : filteredConversations.map((convo) => (
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
          ))}
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
                      <p className="text-sm leading-relaxed">{msg.content}</p>
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
                value={input}
                onChange={(e) => { setInput(e.target.value); handleTypingInput(); }}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 rounded-full border-2 border-gray-200 focus:border-black focus:outline-none transition-all bg-gray-50 text-base"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
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
      `}</style>
    </div>
  );
};

export default AdminCustomerCare;
