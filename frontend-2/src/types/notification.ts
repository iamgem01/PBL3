export type NotificationType =
  | 'CALENDAR_REMINDER'           // Nhắc lịch 15p trước
  | 'CALENDAR_EVENT_CREATED'      // Sự kiện mới
  | 'CALENDAR_EVENT_UPDATED'      // Sự kiện cập nhật
  | 'CALENDAR_EVENT_CANCELLED'    // Sự kiện hủy
  | 'NOTE_SHARED'                 // Note được chia sẻ
  | 'NOTE_COMMENT'                // Comment mới
  | 'NOTE_MENTION'                // Được mention
  | 'WORKSPACE_INVITE'            // Lời mời workspace
  | 'WORKSPACE_JOINED'            // Ai đó join workspace
  | 'SYSTEM_UPDATE'               // Cập nhật hệ thống
  | 'SYSTEM_MAINTENANCE'          // Bảo trì hệ thống
  | 'TASK_ASSIGNED'               // Được giao task
  | 'TASK_COMPLETED'              // Task hoàn thành
  | 'TASK_DUE_SOON';              // Task sắp đến hạn

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationAction {
  label: string;
  url?: string;
  action?: string;
  primary?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  
  // Metadata
  relatedId?: string;           // ID của event, note, task...
  relatedType?: 'event' | 'note' | 'workspace' | 'task';
  
  // Actions
  actions?: NotificationAction[];
  
  // Status
  isRead: boolean;
  isArchived: boolean;
  
  // Timestamps
  createdAt: Date;
  readAt?: Date;
  scheduledFor?: Date;          
  
  // Additional data
  metadata?: Record<string, any>;
  icon?: string;
  avatarUrl?: string;
}

export interface NotificationFilters {
  type?: NotificationType[];
  priority?: NotificationPriority[];
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  relatedId?: string;
  relatedType?: 'event' | 'note' | 'workspace' | 'task';
  actions?: NotificationAction[];
  scheduledFor?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateNotificationInput {
  isRead?: boolean;
  isArchived?: boolean;
  readAt?: Date;
}

// Email notification settings
export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  emailTypes: NotificationType[];
  pushEnabled: boolean;
  pushTypes: NotificationType[];
  quietHoursStart?: string;      
  quietHoursEnd?: string;        
  calendarReminder: boolean;
  calendarReminderMinutes: number; 
}