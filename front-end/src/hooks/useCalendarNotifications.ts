import { useEffect, useCallback, useRef } from "react";
import { useNotificationSound } from "./useNotificationSound";
import { toast } from "sonner";

interface CalendarNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  relatedId?: string;
  metadata?: {
    eventTitle?: string;
    startDate?: string;
    location?: string;
  };
  actions?: Array<{
    label: string;
    url?: string;
    action?: string;
    primary?: boolean;
  }>;
  createdAt: string;
}

const NOTIFICATION_SERVICE_URL =
  import.meta.env.VITE_NOTIFICATION_SERVICE_URL || "http://localhost:5004";
const POLL_INTERVAL = 30000; // Poll every 30 seconds

export const useCalendarNotifications = (userId: string | null) => {
  const { playNotificationSound, playUrgentSound } = useNotificationSound();
  const lastCheckRef = useRef<Date>(new Date());
  const processedNotificationsRef = useRef<Set<string>>(new Set());

  /**
   * Fetch new notifications from server
   */
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${NOTIFICATION_SERVICE_URL}/api/notifications?isRead=false&limit=10`,
        {
          headers: {
            "x-user-id": userId,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      const notifications: CalendarNotification[] = data.notifications || [];

      // Filter new notifications
      const newNotifications = notifications.filter((notif) => {
        const createdAt = new Date(notif.createdAt);
        return (
          createdAt > lastCheckRef.current &&
          !processedNotificationsRef.current.has(notif.id)
        );
      });

      // Process new notifications
      newNotifications.forEach((notif) => {
        processNotification(notif);
        processedNotificationsRef.current.add(notif.id);
      });

      lastCheckRef.current = new Date();
    } catch (error) {
      console.error("❌ Failed to fetch notifications:", error);
    }
  }, [userId]);

  /**
   * Process and display notification
   */
  const processNotification = useCallback(
    (notification: CalendarNotification) => {
      // Play sound based on priority
      if (
        notification.type === "CALENDAR_REMINDER" ||
        notification.priority === "high"
      ) {
        playUrgentSound();
      } else {
        playNotificationSound();
      }

      // Show toast notification
      toast.info(notification.title, {
        description: notification.message,
        duration: 10000, // 10 seconds
        action: notification.actions?.[0]
          ? {
              label: notification.actions[0].label,
              onClick: () => {
                if (notification.actions?.[0]?.url) {
                  window.location.href = notification.actions[0].url;
                }
                markAsRead(notification.id);
              },
            }
          : undefined,
        onDismiss: () => markAsRead(notification.id),
        onAutoClose: () => markAsRead(notification.id),
      });

      // Show browser notification if permission granted
      if ("Notification" in window && Notification.permission === "granted") {
        const browserNotif = new Notification(notification.title, {
          body: notification.message,
          icon: "/logo.png",
          badge: "/logo.png",
          tag: notification.id,
          requireInteraction: notification.priority === "high",
          silent: false, // Let sound play separately
        });

        browserNotif.onclick = () => {
          window.focus();
          if (notification.actions?.[0]?.url) {
            window.location.href = notification.actions[0].url;
          }
          browserNotif.close();
          markAsRead(notification.id);
        };
      }
    },
    [playNotificationSound, playUrgentSound]
  );

  /**
   * Mark notification as read
   */
  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    try {
      await fetch(
        `${NOTIFICATION_SERVICE_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            "x-user-id": userId,
          },
        }
      );
    } catch (error) {
      console.error("❌ Failed to mark notification as read:", error);
    }
  };

  /**
   * Request browser notification permission
   */
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      console.log("📬 Notification permission:", permission);
      return permission === "granted";
    }
    return Notification.permission === "granted";
  }, []);

  // Set up polling for new notifications
  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchNotifications();

    // Request notification permission
    requestNotificationPermission();

    // Set up interval
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [userId, fetchNotifications, requestNotificationPermission]);

  // Listen for visibility change to fetch when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userId) {
        fetchNotifications();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId, fetchNotifications]);

  return {
    requestNotificationPermission,
    processNotification,
  };
};
