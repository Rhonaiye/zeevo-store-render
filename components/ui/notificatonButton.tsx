"use client";

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Bell, X, Package, CreditCard, MessageSquare, UserPlus, Check, User } from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: "order" | "payment" | "message" | "store" | "account" | 'product';
}

const getNotificationIcon = (type: Notification["type"]): React.ReactNode => {
  switch (type) {
    case "order":
      return <Package className="w-4 h-4 text-green-600" />;
    case "payment":
      return <CreditCard className="w-4 h-4 text-green-600" />;
    case "message":
      return <MessageSquare className="w-4 h-4 text-green-600" />;
    case "account":
      return <User className="w-4 h-4 text-green-600" />;
    default:
      return <Bell className="w-4 h-4 text-green-600" />;
  }
};

const getTypeDisplay = (type: Notification["type"]): string => {
  switch (type) {
    case "order":
      return "Order";
    case "payment":
      return "Payment";
    case "message":
      return "Message";
    case "store":
      return "store";
    case "account":
        return "Account";
    case "product":
        return "Product";
    default:
      return "Notification";
  }
};

export default function NotificationButton() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const hasUnread = notifications.some((n) => !n.isRead);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/notification`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: Notification[] = await response.json();
        setNotifications(data);
      } else {
        console.error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/notification/${id}/read`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/notification/mark-all-read`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-green-50"
      >
        <Bell className="w-5 h-5 text-green-600" />
        {/* Badge for unread */}
        {hasUnread && (
          <span className="absolute top-1 right-1 block w-2 h-2 bg-green-500 rounded-full" />
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Notifications Modal */}
      {open && (
        <div className="fixed right-4 sm:right-5 mt-2 w-80 sm:w-96 max-h-[70vh] sm:max-h-[500px] bg-white shadow-lg rounded-xl overflow-hidden z-50 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-sm text-gray-800 text-left">
              Notifications
            </h3>
            <div className="flex items-center space-x-2">
              {hasUnread && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-1 text-xs text-green-600 hover:text-green-700"
                  disabled={loading}
                >
                  <Check className="w-3 h-3" />
                  <span>Mark all</span>
                </button>
              )}
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[calc(70vh-6rem)] sm:max-h-[calc(500px-6rem)] overflow-y-auto">
            {loading ? (
              <p className="p-4 text-center text-xs text-gray-500">
                Loading...
              </p>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-center text-xs text-gray-500">
                No notifications
              </p>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li
                    key={n._id}
                    onClick={() => !n.isRead && markAsRead(n._id)}
                    className={`p-3 border-b border-gray-100 flex items-start space-x-3 cursor-pointer hover:bg-green-50 ${
                      !n.isRead ? "bg-green-50" : ""
                    } ${loading ? "opacity-50" : ""}`}
                  >
                    <div className="flex-shrink-0 pt-1.5">{getNotificationIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm text-gray-800 text-left truncate">
                          {n.title}
                        </p>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex-shrink-0">
                          {getTypeDisplay(n.type)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 text-left">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 text-left">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}