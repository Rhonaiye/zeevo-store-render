'use client';
import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { X, Send, Mail, MessageSquareText, Paperclip } from "lucide-react";

interface Message {
  _id: string;
  sender: string;
  content: string;
  timestamp: string;
}

const socket: Socket = io(process.env.NEXT_PUBLIC_API_BASE_URL);

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return date.toLocaleDateString();
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

const CustomerCareChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(Cookies.get("chat_email") || "");
  const [conversationId, setConversationId] = useState<string | null>(Cookies.get("chat_conversationId") || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [typing, setTyping] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/conversations/${convId}/messages`);
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!conversationId) return;

    const formData = new FormData();
    formData.append('file', file);

    const timestamp = new Date().toISOString();
    const fileMsgId = Date.now().toString() + Math.random();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/upload/cloudfare`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      if (data.fileurl) {
        // Optimistically add file message
        const fileMsg: Message = {
          _id: fileMsgId,
          sender: "user",
          content: data.fileurl,
          timestamp: timestamp,
        };
        setMessages(prev => [...prev, fileMsg]);

        // Emit file message
        socket.emit("send_message", { conversationId, ...fileMsg });
      }
    } catch (err) {
      console.error('File upload error:', err);
      // Optionally remove optimistic messages or show error
    }
  };

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (open) {
      setUnreadCount(0);
    }
  }, [open]);

  useEffect(() => {
    const handleReceiveMessage = (msg: Message) => {
      // Only add admin messages to avoid duplicates from server echo of user messages
      if (msg.sender === "admin") {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        if (!openRef.current) {
          setUnreadCount(prev => prev + 1);
        }
      }
    };

    const handleConversationCreated = ({ conversationId }: { conversationId: string }) => {
      setConversationId(conversationId);
      Cookies.set("chat_conversationId", conversationId);
      fetchMessages(conversationId);
      setIsJoining(false);
    };

    const handleTyping = ({ sender }: { sender: "user" | "admin" }) => {
      if (sender === "admin") {
        setTyping(true);
        setTimeout(() => setTyping(false), 1000);
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("conversation_created", handleConversationCreated);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("conversation_created", handleConversationCreated);
      socket.off("typing", handleTyping);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (conversationId && email) {
      socket.emit("join_conversation", { conversationId, email });
      fetchMessages(conversationId);
    }
  }, [conversationId, email]);

  const joinConversation = () => {
    if (isJoining) return;
    if (!email.trim()) {
      alert("Enter your email to start chat");
      return;
    }
    setIsJoining(true);
    Cookies.set("chat_email", email);
    socket.emit("join_conversation", { conversationId, email });
  };

  const sendMessage = () => {
    if (!conversationId) return;

    const timestamp = new Date().toISOString();

    if (selectedFile) {
      // Upload and add file message
      handleFileUpload(selectedFile);

      setSelectedFile(null);
    }

    if (input.trim()) {
      // Handle text message
      const msg: Message = {
        _id: Date.now().toString(),
        sender: "user",
        content: input,
        timestamp: timestamp,
      };

      // Optimistically add user message
      setMessages(prev => [...prev, msg]);

      // Emit to server
      socket.emit("send_message", { conversationId, ...msg });
      setInput("");
    }
  };

  const endConversation = () => {
    setConversationId(null);
    setMessages([]);
    setUnreadCount(0);
    setSelectedFile(null);
    Cookies.remove("chat_conversationId");
    Cookies.remove("chat_email");
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

  const isMobile = windowWidth <= 768;

  const buttonTitle = !conversationId 
    ? "Contact Customer Support" 
    : `Open chat ${unreadCount > 0 ? `(${unreadCount} unread message${unreadCount > 1 ? 's' : ''})` : ''}`;

  return (
    <div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>

      {!open && (
        <div className="relative inline-block">
          <button
            onClick={() => setOpen(true)}
            title={buttonTitle}
            className={`fixed bottom-4 right-4 w-12 h-12 rounded-full bg-green-500 text-white border-none flex items-center justify-center cursor-pointer shadow-lg z-[9999] transition-all duration-200 hover:scale-105 hover:shadow-xl sm:bottom-6 sm:right-6 sm:w-14 sm:h-14`}
          >
            <MessageSquareText size={isMobile ? 20 : 24} />
          </button>
          {unreadCount > 0 && (
            <div
              className={`absolute bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold min-w-[18px] z-[10000] sm:w-5 sm:h-5 sm:text-sm top-1 right-1 sm:top-2 sm:right-2`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </div>
      )}

      {open && (
        <>
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" 
              onClick={() => setOpen(false)}
            />
          )}
          <div
            className={`fixed bottom-0 right-0 left-0 w-full ${isMobile ? 'h-[70vh] rounded-t-xl' : 'h-screen rounded-none'} bg-white shadow-none flex flex-col overflow-hidden z-[9999] sm:bottom-6 sm:right-6 sm:left-auto sm:w-[380px] sm:h-[600px] sm:rounded-xl sm:shadow-2xl`}
          >
            {/* Header */}
            <div className={`px-4 py-3 bg-green-800 text-white flex justify-between items-center font-medium text-sm sm:text-base sm:px-5 sm:py-4`}>
              <span>Customer Care</span>
              <div className="flex gap-2 items-center">
                {conversationId && (
                  <button
                    onClick={endConversation}
                    className={`bg-white/15 border border-white/25 text-white px-2.5 py-1.5 rounded-xl cursor-pointer text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-sm hover:bg-white/25`}
                  >
                    End Chat
                  </button>
                )}
                <button 
                  onClick={() => setOpen(false)} 
                  className={`bg-transparent border-none text-white cursor-pointer flex items-center justify-center p-1`}
                >
                  <X size={isMobile ? 18 : 20} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className={`flex-1 overflow-y-auto p-4 bg-[#E5DDD5] sm:p-5`}>
              {!conversationId ? (
                <div className="text-center py-8 sm:py-10">
                  <div className={`mb-4 text-gray-800 font-semibold text-lg sm:text-xl`}>
                    Welcome! Let's chat.
                  </div>
                  <div className={`mb-5 text-gray-600 text-sm sm:text-base leading-relaxed`}>
                    Enter your email to get personalized support.
                  </div>
                  <div className={`flex items-center mb-4 bg-white border border-gray-300 rounded-lg p-3 sm:p-4`}>
                    <Mail size={isMobile ? 16 : 18} className="mr-2.5 text-gray-500 flex-shrink-0" />
                    <input
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`flex-1 border-none outline-none bg-transparent text-base text-gray-800`}
                    />
                  </div>
                  <button 
                    onClick={joinConversation} 
                    disabled={!email.trim() || isJoining} 
                    className={`w-full py-3 px-5 bg-green-500 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-600 sm:py-3 sm:px-6 sm:text-lg`}
                  >
                    {isJoining ? (
                      <>
                        <div className={`w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin`} />
                        <span>Joining...</span>
                      </>
                    ) : (
                      "Start Chat"
                    )}
                  </button>
                </div>
              ) : (
                <>
                  {messages.length === 0 && (
                    <div className={`text-center text-gray-600 text-sm sm:text-base py-8 sm:py-10`}>
                      Say hello to start the conversation!
                    </div>
                  )}

                  {messages.every(msg => msg.sender !== "admin") && messages.length > 0 && (
                    <div className={`text-center text-gray-500 text-xs sm:text-sm pb-3 leading-relaxed`}>
                      Admin will connect with you within 5 minutes
                    </div>
                  )}

                  {messages.map(msg => {
                    const isUser = msg.sender === "user";
                    const tailColor = isUser ? "#dcfce7" : "#ffffff";
                    const tailPosition = isUser ? "-left-2" : "-right-2";
                    const tailBorders = isUser ? "border-r-2 border-b-3" : "border-l-2 border-b-3";
                    const tailBorderColor = isUser 
                      ? `transparent ${tailColor} transparent transparent`
                      : `transparent transparent transparent ${tailColor}`;

                    return (
                      <div 
                        key={msg._id} 
                        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2 sm:mb-2.5`}
                      >
                        <div className={`relative max-w-[80%] sm:max-w-[75%] p-3 sm:p-3.5 rounded-lg ${isUser ? "bg-green-100" : "bg-white"} text-gray-800 shadow-sm text-sm sm:text-base flex flex-col`}>
                          {/* WhatsApp tail */}
                          <div 
                            className={`absolute bottom-0 ${tailPosition} w-0 h-0 border-solid border-t-0 ${tailBorders} border-transparent`}
                            style={{ borderColor: tailBorderColor }}
                          />
                          
                          <div className={`mb-1 ${isUser ? "self-end" : "self-start"}`}>
                            {msg.content.startsWith('http') ? (
                              isImageUrl(msg.content) ? (
                                <img 
                                  src={msg.content} 
                                  alt="Attached image" 
                                  className={`max-w-full h-auto rounded-lg block`}
                                />
                              ) : (
                                <a 
                                  href={msg.content} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={`text-green-500 no-underline break-words`}
                                >
                                  📎 {getLinkText(msg.content)}
                                </a>
                              )
                            ) : (
                              <div className="text-sm sm:text-base leading-6">{msg.content}</div>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 self-end mt-auto">
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {typing && (
                    <div className={`flex justify-start mb-3`}>
                      <div className={`bg-white p-2.5 sm:p-3.5 rounded-lg shadow-sm flex gap-1`}>
                        <div className={`w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.32s]`} />
                        <div className={`w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:-0.16s]`} />
                        <div className={`w-2 h-2 rounded-full bg-gray-500 animate-bounce`} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            {conversationId && (
              <div className={`p-2 sm:p-4 bg-gray-100`}>
                <div className={`flex items-center gap-2 bg-white rounded-full p-2 sm:p-3`}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <Paperclip 
                    size={isMobile ? 16 : 18} 
                    onClick={() => fileInputRef.current?.click()} 
                    className={`cursor-pointer text-gray-500 flex-shrink-0 ${selectedFile ? "text-green-500" : ""}`} 
                  />
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={selectedFile ? `Send "${selectedFile.name}"` : "Type a message"}
                    className={`flex-1 py-2 px-0 border-none outline-none bg-transparent text-base text-gray-800`}
                  />
                  <button 
                    onClick={sendMessage} 
                    disabled={!input.trim() && !selectedFile} 
                    className={`w-9 h-9 rounded-full border-none flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${ (input.trim() || selectedFile) ? "bg-green-500 hover:bg-green-600" : "bg-gray-300" }`}
                  >
                    <Send size={isMobile ? 16 : 18} className={(input.trim() || selectedFile) ? "text-white" : "text-gray-500"} />
                  </button>
                </div>
                {selectedFile && (
                  <div className={`px-3 py-1 text-xs text-gray-600 text-center`}>
                    File selected: {selectedFile.name}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerCareChat;