import { handleResponse } from "./utils";
import { getAuthHeaders } from "@/utils/authUtils";
import type {
  Notification,
  NotificationFilters,
  NotificationStats,
  CreateNotificationInput,
} from "@/types/notification";

const NOTIFICATION_SERVICE_URL =
  import.meta.env.VITE_NOTIFICATION_SERVICE_URL || "http://localhost:5004";

/**
 * Get all notifications
 */
export const getAllNotifications = async (
  filters?: NotificationFilters & { limit?: number; skip?: number }
): Promise<Notification[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.type?.length)
      queryParams.append("type", filters.type.join(","));
    if (filters?.priority?.length)
      queryParams.append("priority", filters.priority.join(","));
    if (filters?.isRead !== undefined)
      queryParams.append("isRead", String(filters.isRead));
    if (filters?.limit) queryParams.append("limit", String(filters.limit));
    if (filters?.skip) queryParams.append("skip", String(filters.skip));

    const url = `${NOTIFICATION_SERVICE_URL}/api/notifications${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    console.log("🔔 [Notification] Fetching notifications from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    const data = await handleResponse(response);
    console.log(
      "✅ [Notification] Fetched notifications:",
      data.notifications.length
    );

    // Transform _id to id for MongoDB compatibility
    const notifications = data.notifications.map((n: any) => ({
      ...n,
      id: n.id || n._id, // Use id if exists, fallback to _id
    }));

    return notifications;
  } catch (error) {
    console.error("❌ [Notification] Error fetching notifications:", error);
    return [];
  }
};

/**
 * Get unread count with silent failure
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    // Use AbortController with timeout to fail fast
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const response = await fetch(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/unread-count`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    const data = await handleResponse(response);
    return data.count;
  } catch (error) {
    // Silently fail - notification service is optional
    return 0;
  }
};

/**
 * Get notification stats
 */
export const getNotificationStats = async (): Promise<NotificationStats> => {
  try {
    const response = await fetch(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/stats`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error("❌ [Notification] Error getting stats:", error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (id: string): Promise<Notification> => {
  try {
    console.log("📖 [Notification] Marking as read:", id);

    const response = await fetch(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/${id}/read`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    const data = await handleResponse(response);
    console.log("✅ [Notification] Marked as read");
    return data.notification;
  } catch (error) {
    console.error("❌ [Notification] Error marking as read:", error);
    throw error;
  }
};

/**
 * Mark all as read
 */
export const markAllAsRead = async (): Promise<void> => {
  try {
    console.log("📖 [Notification] Marking all as read");

    const response = await fetch(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/mark-all-read`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    await handleResponse(response);
    console.log("✅ [Notification] All marked as read");
  } catch (error) {
    console.error("❌ [Notification] Error marking all as read:", error);
    throw error;
  }
};

/**
 * Archive (delete) notification
 */
export const archiveNotification = async (id: string): Promise<void> => {
  try {
    console.log("🗑️ [Notification] Archiving:", id);

    const response = await fetch(
      `${NOTIFICATION_SERVICE_URL}/api/notifications/${id}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    await handleResponse(response);
    console.log("✅ [Notification] Archived");
  } catch (error) {
    console.error("❌ [Notification] Error archiving:", error);
    throw error;
  }
};

/**
 * Create notification (usually called from other services)
 */
export const createNotification = async (
  input: CreateNotificationInput
): Promise<Notification> => {
  try {
    console.log("🔔 [Notification] Creating:", input.type);

    const response = await fetch(
      `${NOTIFICATION_SERVICE_URL}/api/notifications`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(input),
      }
    );

    const data = await handleResponse(response);
    console.log("✅ [Notification] Created");
    return data.notification;
  } catch (error) {
    console.error("❌ [Notification] Error creating:", error);
    throw error;
  }
};

/**
 * Poll for new notifications (for real-time updates without WebSocket)
 */
// FIX: Replaced NodeJS.Timeout with ReturnType<typeof setInterval>
let pollingInterval: ReturnType<typeof setInterval> | null = null;

export const startNotificationPolling = (
  callback: (count: number) => void,
  intervalMs: number = 30000 // 30 seconds
) => {
  // Clear existing interval
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }

  // Initial fetch (with silent failure)
  getUnreadCount()
    .then(callback)
    .catch(() => {});

  // Start polling
  pollingInterval = setInterval(() => {
    getUnreadCount()
      .then(callback)
      .catch(() => {});
  }, intervalMs);

  console.log("🔄 [Notification] Polling started (graceful mode)");
};

export const stopNotificationPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log("⏸️ [Notification] Polling stopped");
  }
};
