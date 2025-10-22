'use client';
import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";
import { MessageCircle, X, Send, Mail } from "lucide-react";

interface Message {
  _id: string;
  sender: "user" | "admin";
  content: string;
  timestamp: string;
}

const socket: Socket = io("https://zeevo-backend-production.up.railway.app"); // replace with your server URL

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
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1024);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages from server
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

  // Window resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Socket listeners
  useEffect(() => {
    const handleReceiveMessage = (msg: Message) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev; // prevent duplicates
        return [...prev, msg];
      });
    };

    const handleConversationCreated = ({ conversationId }: { conversationId: string }) => {
      setConversationId(conversationId);
      Cookies.set("chat_conversationId", conversationId);
      fetchMessages(conversationId);
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Rejoin conversation on reload
  useEffect(() => {
    if (conversationId && email) {
      socket.emit("join_conversation", { conversationId, email });
      fetchMessages(conversationId);
    }
  }, [conversationId, email]);

  const joinConversation = () => {
    if (!email.trim()) return alert("Enter your email to start chat");
    Cookies.set("chat_email", email);
    socket.emit("join_conversation", { conversationId, email });
  };

  const sendMessage = () => {
    if (!input.trim() || !conversationId) return;

    const msg: Message = {
      _id: Date.now().toString(), // unique ID
      sender: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    // Emit to server only
    socket.emit("send_message", { conversationId, ...msg });
    setInput("");
  };

  const endConversation = () => {
    setConversationId(null);
    setMessages([]);
    Cookies.remove("chat_conversationId");
    Cookies.remove("chat_email");
  };

  const isMobile = windowWidth <= 768;
  const chatWidth = isMobile ? "calc(100vw - 40px)" : "360px";
  const chatHeight = isMobile ? "calc(100vh - 350px)" : "520px";
  const buttonSize = isMobile ? 56 : 60;

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: buttonSize,
            height: buttonSize,
            borderRadius: "50%",
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
            zIndex: 9999,
            transition: "all 0.2s ease",
          }}
        >
          <MessageCircle size={isMobile ? 22 : 24} />
        </button>
      )}

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: chatWidth,
            height: chatHeight,
            borderRadius: 20,
            backgroundColor: "#fff",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999,
            transition: "all 0.3s ease",
          }}
        >
          {/* Header */}
          <div style={{
            padding: "16px 20px",
            background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 600,
            fontSize: "16px",
          }}>
            <span>Customer Care</span>
            <div style={{ display: "flex", gap: 8 }}>
              {conversationId && (
                <button
                  onClick={endConversation}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    padding: "6px 12px",
                    borderRadius: 16,
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  End Chat
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: 20, backgroundColor: "#f8fafc" }}>
            {!conversationId ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ marginBottom: 24, color: "#334155", fontSize: "18px", fontWeight: 600 }}>
                  Welcome! Let's chat.
                </div>
                <div style={{ marginBottom: 24, color: "#64748b", fontSize: "14px" }}>
                  Enter your email to get personalized support.
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 20, backgroundColor: "#fff", border: "2px solid #e2e8f0", borderRadius: 12, padding: "12px 16px" }}>
                  <Mail size={18} style={{ marginRight: 12, color: "#94a3b8" }} />
                  <input
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "16px", color: "#334155" }}
                  />
                </div>
                <button onClick={joinConversation} disabled={!email.trim()} style={{
                  width: "100%", padding: "12px 24px",
                  background: email.trim() ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)" : "#cbd5e1",
                  color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600,
                  cursor: email.trim() ? "pointer" : "not-allowed"
                }}>Start Chat</button>
              </div>
            ) : (
              <>
                {messages.length === 0 && (
                  <div style={{ textAlign: "center", color: "#64748b", fontSize: 14, padding: "40px 0" }}>
                    Say hello to start the conversation!
                  </div>
                )}

                {/* Show admin not connected message */}
                {messages.every(msg => msg.sender !== "admin") && messages.length > 0 && (
                  <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, paddingBottom: 16 }}>
                    Admin will connect with you within 5 minutes
                  </div>
                )}

                {messages.map(msg => (
                  <div key={msg._id} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", marginBottom: 16 }}>
                    <div style={{
                      maxWidth: "75%",
                      padding: "12px 16px",
                      borderRadius: 20,
                      background: msg.sender === "user" ? "#4caf50" : "#fff",
                      color: msg.sender === "user" ? "#fff" : "#334155",
                      boxShadow: msg.sender === "user" ? "0 4px 12px rgba(76,175,80,0.3)" : "0 2px 8px rgba(0,0,0,0.08)"
                    }}>
                      {msg.content}
                      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6, textAlign: msg.sender === "user" ? "right" : "left" }}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}

                {typing && <div style={{ fontStyle: "italic", color: "#64748b", marginBottom: 16 }}>Admin is typing...</div>}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          {conversationId && (
            <div style={{ padding: "16px 20px", backgroundColor: "#fff", borderTop: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, backgroundColor: "#f8fafc", borderRadius: 24, padding: "8px 16px", border: "1px solid #e2e8f0" }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  style={{ flex: 1, padding: "8px 0", borderRadius: 20, border: "none", outline: "none", backgroundColor: "transparent", fontSize: 15, color: "#334155" }}
                />
                <button onClick={sendMessage} disabled={!input.trim()} style={{
                  width: 40, height: 40, borderRadius: "50%", backgroundColor: input.trim() ? "#4caf50" : "#f1f5f9", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "not-allowed"
                }}>
                  <Send size={18} color={input.trim() ? "#fff" : "#94a3b8"} />
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
