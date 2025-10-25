'use client';
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { X, Send, Mail, MessageSquareText, Paperclip } from "lucide-react";

interface Message {
  _id: string;
  sender: string;
  content: string;
  timestamp: string;
}

const socket: Socket = io(process.env.NEXT_PUBLIC_API_BASE_URL || "");

const formatTime = (timestamp: string): string => {
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
  const [open, setOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(Cookies.get("chat_email") || "");
  const [conversationId, setConversationId] = useState<string | null>(Cookies.get("chat_conversationId") || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [typing, setTyping] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat status: "idle" (no convo), "open" (active), "ending" (we've requested end), "ended" (closed)
  const [chatStatus, setChatStatus] = useState<"idle" | "open" | "ending" | "ended">(
    conversationId ? "open" : "idle"
  );
  const [endedBy, setEndedBy] = useState<string | null>(null);
  const [endedAt, setEndedAt] = useState<string | null>(null);

  const fetchMessages = async (convId: string): Promise<void> => {
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

  const handleFileUpload = async (file: File): Promise<void> => {
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
    // Handlers
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
      setIsJoining(false);
      setChatStatus("open");
      fetchMessages(conversationId);
    };

    const handleTyping = ({ sender }: { sender: "user" | "admin" }) => {
      if (sender === "admin") {
        setTyping(true);
        setTimeout(() => setTyping(false), 1000);
      }
    };

    const handleChatEnded = (data: any) => {
      // Support multiple payload shapes from server
      // shape A: { conversation: {...}, message: "..."}
      // shape B: { conversationId, endedBy, endedAt }
      let conv: any = null;
      if (data?.conversation) conv = data.conversation;
      else if (data?.conversationId) conv = {
        _id: data.conversationId,
        status: "ended",
        endedBy: data.endedBy,
        endedAt: data.endedAt,
      };

      // If conv exists and matches our current conversationId, update UI
      if (conv && (!conversationId || conv._id === conversationId)) {
        setChatStatus("ended");
        setEndedBy(conv.endedBy ?? null);
        setEndedAt(conv.endedAt ? new Date(conv.endedAt).toISOString() : new Date().toISOString());

        // remove stored cookies (we treat ended chat as session-closed for the user)
        Cookies.remove("chat_conversationId");
        Cookies.remove("chat_email");

        // notify user visually
        setUnreadCount(0);
      }
    };

    const handleConversationUpdated = (updatedConv: any) => {
      // If updated conversation corresponds to this convo, reflect ended status too
      if (updatedConv && updatedConv._id === conversationId) {
        if (updatedConv.status === "ended") {
          setChatStatus("ended");
          setEndedBy(updatedConv.endedBy ?? null);
          setEndedAt(updatedConv.endedAt ? new Date(updatedConv.endedAt).toISOString() : new Date().toISOString());
          Cookies.remove("chat_conversationId");
          Cookies.remove("chat_email");
        }
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("conversation_created", handleConversationCreated);
    socket.on("typing", handleTyping);
    socket.on("chat_ended", handleChatEnded);
    socket.on("conversation_updated", handleConversationUpdated);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("conversation_created", handleConversationCreated);
      socket.off("typing", handleTyping);
      socket.off("chat_ended", handleChatEnded);
      socket.off("conversation_updated", handleConversationUpdated);
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, chatStatus]);

  useEffect(() => {
    if (conversationId && email) {
      socket.emit("join_conversation", { conversationId, email });
      fetchMessages(conversationId);
      setChatStatus("open");
    }
  }, [conversationId, email]);

  const joinConversation = (): void => {
    if (isJoining) return;
    if (!email.trim()) {
      alert("Enter your email to start chat");
      return;
    }
    setIsJoining(true);
    Cookies.set("chat_email", email);
    // If there's no conversationId this will create a new one on server
    socket.emit("join_conversation", { conversationId, email });
  };

  const sendMessage = (): void => {
    if (!conversationId || chatStatus !== "open") return;

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

  const requestEndConversation = (): void => {
    // Trigger server-side end_chat; server will confirm via 'chat_ended' event
    if (!conversationId) {
      // no conversation to end — fallback to clearing local state
      clearChatSession();
      return;
    }
    setChatStatus("ending");
    socket.emit("end_chat", { conversationId, endedBy: "user" });
  };

  const clearChatSession = (): void => {
    setConversationId(null);
    setMessages([]);
    setUnreadCount(0);
    setSelectedFile(null);
    setChatStatus("idle");
    setEndedBy(null);
    setEndedAt(null);
    Cookies.remove("chat_conversationId");
    Cookies.remove("chat_email");
  };

  const startNewChat = (): void => {
    // Clear session and allow user to enter email again
    clearChatSession();
    setOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
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
    ? "Contact Zeevo Support"
    : `Open chat ${unreadCount > 0 ? `(${unreadCount} unread message${unreadCount > 1 ? 's' : ''})` : ''}`;

  const messageVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: [0, 0, 0.2, 1],
      },
    }),
    exit: { opacity: 0, y: -10, scale: 0.95 },
  } as const;

  const welcomeVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0, 0, 0.2, 1] },
    },
  } as const;

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.1)" },
    rest: { scale: 1, boxShadow: "none" },
  } as const;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  } as const;

  return (
    <div className="relative">
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
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative inline-block"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            title={buttonTitle}
            className={`fixed bottom-4 right-4 w-12 h-12 rounded-full bg-green-500 text-white border-none flex items-center justify-center cursor-pointer shadow-lg z-[9999] transition-all duration-200 hover:shadow-xl sm:bottom-6 sm:right-6 sm:w-14 sm:h-14`}
          >
            <MessageSquareText size={isMobile ? 20 : 24} />
          </motion.button>
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={`absolute bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold min-w-[18px] z-50 sm:w-5 sm:h-5 sm:text-sm top-1 right-1 sm:top-2 sm:right-2`}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {open && (
          <>
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setOpen(false)}
              />
            )}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className={`fixed bottom-0 right-0 left-0 w-full ${isMobile ? "h-[70vh] rounded-t-xl" : "h-screen rounded-none"} bg-gradient-to-br from-white to-gray-50 flex flex-col overflow-hidden z-50 shadow-2xl sm:bottom-6 sm:right-6 sm:left-auto sm:w-[380px] sm:h-[600px] sm:rounded-xl`}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white flex justify-between items-center font-medium text-sm sm:text-base sm:px-5 sm:py-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">Z</span>
                  </div>
                  <span>Zeevo Support</span>
                </div>
                <div className="flex gap-2 items-center">
                  {conversationId && chatStatus === "open" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={requestEndConversation}
                      className="bg-white/15 border border-white/25 text-white px-2.5 py-1.5 rounded-xl cursor-pointer text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-sm hover:bg-white/25"
                    >
                      End Chat
                    </motion.button>
                  )}

                  {/* If chat is currently ending, show small spinner/button */}
                  {chatStatus === "ending" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white/15 border border-white/25 text-white px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: [0, 0, 1, 1] }}
                        style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: 9999 }}
                      />
                      Ending...
                    </motion.div>
                  )}

                  {chatStatus === "ended" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startNewChat}
                      className="bg-white/15 border border-white/25 text-white px-2.5 py-1.5 rounded-xl cursor-pointer text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-sm hover:bg-white/25"
                    >
                      Start new chat
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setOpen(false)}
                    className="bg-transparent border-none text-white cursor-pointer flex items-center justify-center p-1"
                  >
                    <X size={isMobile ? 18 : 20} />
                  </motion.button>
                </div>
              </motion.div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gradient-to-b from-white via-gray-50 to-transparent">
                {!conversationId ? (
                  <motion.div
                    variants={welcomeVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                      className="mb-6 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto"
                    >
                      <Mail className="text-white" size={24} />
                    </motion.div>
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mb-4 text-gray-800 font-semibold text-xl sm:text-2xl"
                    >
                      Welcome to Zeevo Support!
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mb-6 text-gray-600 text-sm sm:text-base leading-relaxed max-w-md"
                    >
                      Enter your email to get personalized support.
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center w-full max-w-md bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                    >
                      <Mail size={isMobile ? 16 : 18} className="mr-2.5 text-gray-400 flex-shrink-0" />
                      <input
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        className="flex-1 border-none outline-none bg-transparent text-base text-gray-800 placeholder-gray-400"
                      />
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      onClick={joinConversation}
                      disabled={!email.trim() || isJoining}
                      className="mt-6 w-full max-w-md py-3 px-6 bg-green-500 text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-600 shadow-md"
                    >
                      {isJoining ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: [0, 0, 1, 1] }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          <span>Joining...</span>
                        </>
                      ) : (
                        "Start Chat with Zeevo"
                      )}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <AnimatePresence>
                      {chatStatus === "ended" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-gray-800"
                        >
                          {endedBy ? `This chat was closed by ${endedBy}.` : "This chat has been closed."}
                          {endedAt && (
                            <div className="text-xs text-gray-600 mt-1">Closed at: {formatTime(endedAt)}</div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {messages.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-gray-600 text-sm sm:text-base py-8 sm:py-10"
                      >
                        Say hello to start the conversation with Zeevo!
                      </motion.div>
                    )}

                    {messages.every(msg => msg.sender !== "admin") && messages.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-gray-500 text-xs sm:text-sm pb-4 leading-relaxed"
                      >
                        Zeevo Support will connect with you within 5 minutes
                      </motion.div>
                    )}

                    <AnimatePresence>
                      {messages.map((msg, index) => {
                        const isUser = msg.sender === "user";
                        const tailColor = isUser ? "#dcfce7" : "#ffffff";
                        const tailPosition = isUser ? "-left-2" : "-right-2";
                        const tailBorders = isUser ? "border-r-2 border-b-3" : "border-l-2 border-b-3";
                        const tailBorderColor = isUser
                          ? `transparent ${tailColor} transparent transparent`
                          : `transparent transparent transparent ${tailColor}`;

                        return (
                          <motion.div
                            key={msg._id}
                            variants={messageVariants}
                            initial="hidden"
                            animate="visible"
                            custom={index}
                            exit="exit"
                            className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2 sm:mb-3`}
                          >
                            <motion.div
                              layout
                              className={`relative max-w-[80%] sm:max-w-[75%] p-3 sm:p-4 rounded-2xl ${isUser ? "bg-green-100" : "bg-white"} text-gray-800 shadow-sm text-sm sm:text-base flex flex-col border border-gray-100`}
                            >
                              {/* WhatsApp tail */}
                              <div
                                className={`absolute bottom-0 ${tailPosition} w-0 h-0 border-solid border-t-0 ${tailBorders} border-transparent`}
                                style={{ borderColor: tailBorderColor }}
                              />

                              <motion.div
                                initial={{ opacity: 0, x: isUser ? 10 : -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className={`mb-1 ${isUser ? "self-end" : "self-start"}`}
                              >
                                {msg.content.startsWith('http') ? (
                                  isImageUrl(msg.content) ? (
                                    <motion.img
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      src={msg.content}
                                      alt="Attached image"
                                      className="max-w-full h-auto rounded-xl block"
                                    />
                                  ) : (
                                    <a
                                      href={msg.content}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-green-600 no-underline break-words hover:underline"
                                    >
                                      📎 {getLinkText(msg.content)}
                                    </a>
                                  )
                                ) : (
                                  <div className="text-sm sm:text-base leading-6 whitespace-pre-wrap">{msg.content}</div>
                                )}
                              </motion.div>
                              <div className="text-xs text-gray-500 self-end mt-auto flex items-center gap-1">
                                <motion.div
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="w-1 h-1 rounded-full bg-gray-400"
                                />
                                {formatTime(msg.timestamp)}
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {typing && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start mb-3"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm flex gap-1 border border-gray-100"
                        >
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-gray-400"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 rounded-full bg-gray-400"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 rounded-full bg-gray-400"
                          />
                        </motion.div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </motion.div>
                )}
              </div>

              {/* Input */}
              {conversationId && chatStatus === "open" && (
                <motion.div
                  layout
                  className="p-4 sm:p-5 bg-white border-t border-gray-200 shadow-lg"
                >
                  <motion.div
                    variants={inputVariants}
                    animate={input.trim() ? "focus" : "rest"}
                    className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 shadow-inner"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2 rounded-xl transition-colors ${selectedFile ? "bg-green-100 text-green-600" : "text-gray-400 hover:bg-gray-200"}`}
                    >
                      <Paperclip size={isMobile ? 16 : 18} />
                    </motion.button>
                    <input
                      value={input}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && sendMessage()}
                      placeholder={selectedFile ? `Send "${selectedFile.name}"` : "Type a message..."}
                      className="flex-1 py-3 px-4 border-none outline-none bg-transparent text-base text-gray-800 placeholder-gray-500"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!input.trim() && !selectedFile}
                      className={`w-10 h-10 rounded-xl border-none flex items-center justify-center transition-all disabled:bg-gray-300 disabled:cursor-not-allowed ${(input.trim() || selectedFile) ? "bg-green-500 hover:bg-green-600 text-white shadow-md" : "bg-gray-200 text-gray-400"}`}
                    >
                      <Send size={isMobile ? 16 : 18} />
                    </motion.button>
                  </motion.div>
                  <AnimatePresence>
                    {selectedFile && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3 py-1 text-xs text-gray-600 text-center mt-2"
                      >
                        File selected: {selectedFile.name}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* If conversation exists but is ended, show small footer that allows starting a new chat */}
              {conversationId && chatStatus === "ended" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-50 text-center text-sm text-gray-700 border-t border-gray-200"
                >
                  This conversation is closed.{" "}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startNewChat}
                    className="underline text-green-600 hover:no-underline ml-1 font-medium"
                  >
                    Start a new chat
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerCareChat;