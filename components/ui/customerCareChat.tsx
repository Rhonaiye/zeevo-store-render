'use client';
import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import {  X, Send, Mail, MessageSquareText } from "lucide-react";

interface Message {
  _id: string;
  sender: string;
  content: string;
  timestamp: string;
}

const socket: Socket = io("https://zeevo-backend-production.up.railway.app");

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return date.toLocaleDateString();
};

const CustomerCareChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(Cookies.get("chat_email") || "");
  const [conversationId, setConversationId] = useState<string | null>(Cookies.get("chat_conversationId") || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);

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
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      if (!openRef.current && msg.sender === "admin") {
        setUnreadCount(prev => prev + 1);
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
  }, []); // Removed [open] dependency to avoid stale closures

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
    if (!email.trim() || isJoining) return;
    if (!email.trim()) return alert("Enter your email to start chat");
    setIsJoining(true);
    Cookies.set("chat_email", email);
    socket.emit("join_conversation", { conversationId, email });
  };

  const sendMessage = () => {
    if (!input.trim() || !conversationId) return;

    const msg: Message = {
      _id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    socket.emit("send_message", { conversationId, ...msg });
    setInput("");
  };

  const endConversation = () => {
    setConversationId(null);
    setMessages([]);
    setUnreadCount(0);
    Cookies.remove("chat_conversationId");
    Cookies.remove("chat_email");
  };

  const isMobile = windowWidth <= 768;

  // WhatsApp pattern background
  const whatsappPattern = `data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='pattern' x='0' y='0' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='15' cy='15' r='0.8' fill='%23d9d9d9' opacity='0.4'/%3E%3Ccircle cx='45' cy='45' r='0.8' fill='%23d9d9d9' opacity='0.4'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='60' height='60' fill='url(%23pattern)'/%3E%3C/svg%3E`;

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
      `}</style>

      {!open && (
        <div style={{ position: "relative", display: "inline-block" }}>
          <button
            onClick={() => setOpen(true)}
            title={buttonTitle}
            style={{
              position: "fixed",
              bottom: isMobile ? 16 : 24,
              right: isMobile ? 16 : 24,
              width: isMobile ? 52 : 60,
              height: isMobile ? 52 : 60,
              borderRadius: "50%",
              backgroundColor: "#25D366",
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(37, 211, 102, 0.4)",
              zIndex: 9999,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(37, 211, 102, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(37, 211, 102, 0.4)";
            }}
          >
            <MessageSquareText size={isMobile ? 20 : 24} />
          </button>
          {unreadCount > 0 && (
            <div
              style={{
                position: "absolute",
                top: isMobile ? 4 : 8,
                right: isMobile ? 4 : 8,
                backgroundColor: "#ff4444",
                color: "#fff",
                borderRadius: "50%",
                width: isMobile ? 18 : 20,
                height: isMobile ? 18 : 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isMobile ? 10 : 12,
                fontWeight: "bold",
                minWidth: 18,
                zIndex: 10000,
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </div>
      )}

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: isMobile ? 0 : 24,
            right: isMobile ? 0 : 24,
            left: isMobile ? 0 : "auto",
            width: isMobile ? "100vw" : "380px",
            height: isMobile ? "80vh" : "600px",
            borderRadius: isMobile ? 0 : 16,
            backgroundColor: "#fff",
            boxShadow: isMobile ? "none" : "0 20px 60px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <div style={{
            padding: isMobile ? "14px 16px" : "16px 20px",
            backgroundColor: "#075E54",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 500,
            fontSize: isMobile ? "14px" : "16px",
          }}>
            <span>Customer Care</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {conversationId && (
                <button
                  onClick={endConversation}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "#fff",
                    padding: isMobile ? "5px 10px" : "6px 12px",
                    borderRadius: 16,
                    cursor: "pointer",
                    fontSize: isMobile ? "12px" : "13px",
                    fontWeight: 500,
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  }}
                >
                  End Chat
                </button>
              )}
              <button 
                onClick={() => setOpen(false)} 
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  color: "#fff", 
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 4,
                }}
              >
                <X size={isMobile ? 18 : 20} />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div style={{ 
            flex: 1, 
            overflowY: "auto", 
            padding: isMobile ? "16px 12px" : "20px 16px", 
            backgroundColor: "#E5DDD5",
            backgroundImage: `url("${whatsappPattern}")`,
            backgroundRepeat: "repeat",
          }}>
            {!conversationId ? (
              <div style={{ textAlign: "center", padding: isMobile ? "30px 0" : "40px 0" }}>
                <div style={{ 
                  marginBottom: isMobile ? 16 : 20, 
                  color: "#303030", 
                  fontSize: isMobile ? "16px" : "18px", 
                  fontWeight: 600 
                }}>
                  Welcome! Let's chat.
                </div>
                <div style={{ 
                  marginBottom: isMobile ? 20 : 24, 
                  color: "#667781", 
                  fontSize: isMobile ? "13px" : "14px",
                  lineHeight: 1.5,
                }}>
                  Enter your email to get personalized support.
                </div>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  marginBottom: isMobile ? 16 : 20, 
                  backgroundColor: "#fff", 
                  border: "1px solid #D1D7DB", 
                  borderRadius: 8, 
                  padding: isMobile ? "10px 14px" : "12px 16px" 
                }}>
                  <Mail size={isMobile ? 16 : 18} style={{ marginRight: 10, color: "#8696A0", flexShrink: 0 }} />
                  <input
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ 
                      flex: 1, 
                      border: "none", 
                      outline: "none", 
                      background: "transparent", 
                      fontSize: isMobile ? "15px" : "15px", 
                      color: "#303030" 
                    }}
                  />
                </div>
                <button 
                  onClick={joinConversation} 
                  disabled={!email.trim() || isJoining} 
                  style={{
                    width: "100%", 
                    padding: isMobile ? "11px 20px" : "12px 24px",
                    backgroundColor: (email.trim() && !isJoining) ? "#25D366" : "#A9B3BA",
                    color: "#fff", 
                    border: "none", 
                    borderRadius: 8, 
                    fontSize: isMobile ? "14px" : "15px", 
                    fontWeight: 600,
                    cursor: (email.trim() && !isJoining) ? "pointer" : "not-allowed",
                    transition: "background 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    if (email.trim() && !isJoining) e.currentTarget.style.backgroundColor = "#20BD5F";
                  }}
                  onMouseLeave={(e) => {
                    if (email.trim() && !isJoining) e.currentTarget.style.backgroundColor = "#25D366";
                  }}
                >
                  {isJoining ? (
                    <>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid #fff",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }} />
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
                  <div style={{ 
                    textAlign: "center", 
                    color: "#667781", 
                    fontSize: isMobile ? "13px" : "14px", 
                    padding: isMobile ? "30px 0" : "40px 0" 
                  }}>
                    Say hello to start the conversation!
                  </div>
                )}

                {messages.every(msg => msg.sender !== "admin") && messages.length > 0 && (
                  <div style={{ 
                    textAlign: "center", 
                    color: "#8696A0", 
                    fontSize: isMobile ? "12px" : "13px", 
                    paddingBottom: 12,
                    lineHeight: 1.4,
                  }}>
                    Admin will connect with you within 5 minutes
                  </div>
                )}

                {messages.map(msg => (
                  <div 
                    key={msg._id} 
                    style={{ 
                      display: "flex", 
                      justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", 
                      marginBottom: isMobile ? 8 : 10 
                    }}
                  >
                    <div style={{
                      position: "relative",
                      maxWidth: isMobile ? "80%" : "75%",
                      padding: isMobile ? "8px 12px" : "10px 14px",
                      borderRadius: 8,
                      background: msg.sender === "user" ? "#D9FDD3" : "#fff",
                      color: "#303030",
                      boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
                      fontSize: isMobile ? "13px" : "14px",
                      lineHeight: 1.5,
                    }}>
                      {/* WhatsApp tail */}
                      <div style={{
                        position: "absolute",
                        top: 0,
                        [msg.sender === "user" ? "right" : "left"]: -8,
                        width: 0,
                        height: 0,
                        borderStyle: "solid",
                        borderWidth: msg.sender === "user" ? "0 0 13px 8px" : "0 8px 13px 0",
                        borderColor: msg.sender === "user" 
                          ? `transparent transparent transparent ${msg.sender === "user" ? "#D9FDD3" : "#fff"}`
                          : `transparent ${msg.sender === "user" ? "#D9FDD3" : "#fff"} transparent transparent`,
                      }} />
                      
                      <div style={{ paddingRight: 50 }}>
                        {msg.content}
                      </div>
                      <div style={{ 
                        position: "absolute",
                        bottom: 6,
                        right: 10,
                        fontSize: isMobile ? "10px" : "11px", 
                        color: "#667781",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}

                {typing && (
                  <div style={{ 
                    display: "flex",
                    justifyContent: "flex-start",
                    marginBottom: 12,
                  }}>
                    <div style={{
                      backgroundColor: "#fff",
                      padding: "10px 14px",
                      borderRadius: 8,
                      boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
                      display: "flex",
                      gap: 4,
                    }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#8696A0",
                        animation: "bounce 1.4s infinite ease-in-out both",
                        animationDelay: "-0.32s",
                      }} />
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#8696A0",
                        animation: "bounce 1.4s infinite ease-in-out both",
                        animationDelay: "-0.16s",
                      }} />
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#8696A0",
                        animation: "bounce 1.4s infinite ease-in-out both",
                      }} />
                    </div>
                  </div>
                )}
                <style>{`
                  @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                  }
                `}</style>
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          {conversationId && (
            <div style={{ 
              padding: isMobile ? "8px 12px 12px" : "10px 16px", 
              backgroundColor: "#F0F2F5",
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 8, 
                backgroundColor: "#fff", 
                borderRadius: 24, 
                padding: isMobile ? "6px 12px" : "8px 16px",
              }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message"
                  style={{ 
                    flex: 1, 
                    padding: isMobile ? "7px 0" : "8px 0", 
                    border: "none", 
                    outline: "none", 
                    backgroundColor: "transparent", 
                    fontSize: isMobile ? "14px" : "15px", 
                    color: "#303030" 
                  }}
                />
                <button 
                  onClick={sendMessage} 
                  disabled={!input.trim()} 
                  style={{
                    width: isMobile ? 36 : 40, 
                    height: isMobile ? 36 : 40, 
                    borderRadius: "50%", 
                    backgroundColor: input.trim() ? "#25D366" : "#D1D7DB", 
                    border: "none", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    cursor: input.trim() ? "pointer" : "not-allowed",
                    flexShrink: 0,
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (input.trim()) e.currentTarget.style.backgroundColor = "#20BD5F";
                  }}
                  onMouseLeave={(e) => {
                    if (input.trim()) e.currentTarget.style.backgroundColor = "#25D366";
                  }}
                >
                  <Send size={isMobile ? 16 : 18} color={input.trim() ? "#fff" : "#8696A0"} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerCareChat;