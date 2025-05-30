import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { socket } from "@/services/SocketService";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router";

type NotificationType = {
  id: string;
  conversation_id: string;
  content: string;
  author_id: string;
  display_name: string;
  username?: string;
  created_at: string;
};

interface NotificationContextType {
  notifications: NotificationType[];
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!user) return;

    const handleNewNotification = (message: NotificationType) => {
      const currentChatPage = `/chats/${message.conversation_id}`;
      if (pathname === currentChatPage) {
        return;
      }
      setNotifications((prev) => [...prev, message]);
      toast(`New message from ${message.display_name || message.username || "Someone"}`, {
        description: message.content.length > 30 ? `${message.content.substring(0, 30)}...` : message.content,
        action: {
          label: "View",
          onClick: () => navigate(currentChatPage, { replace: true })
        }
      });
    };

    socket.on(`new-notification-${user.id}`, handleNewNotification);
    return () => {
      socket.off(`new-notification-${user.id}`);
    };
  }, [user, pathname]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return <NotificationContext.Provider value={{ notifications, markAsRead, clearNotifications }}>{children}</NotificationContext.Provider>;
};
