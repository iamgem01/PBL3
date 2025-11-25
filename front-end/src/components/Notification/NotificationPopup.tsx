// components/NotificationPopup.tsx - Notion Style (No Backdrop)
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, CheckCheck, Trash2, Calendar, FileText, Users, Settings as SettingsIcon } from 'lucide-react';
import { 
  getAllNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead,
  archiveNotification,
  startNotificationPolling,
  stopNotificationPolling
} from '@/services/notificationService';
import type { Notification, NotificationType } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPopupProps {
  collapsed?: boolean;
}

export default function NotificationPopup({ collapsed = false }: NotificationPopupProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'calendar' | 'updates'>('all');
  const [loading, setLoading] = useState(false);
  
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  // Load notifications
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const filters: any = { limit: 50 };
      
      if (filter === 'unread') {
        filters.isRead = false;
      } else if (filter === 'calendar') {
        filters.type = ['CALENDAR_REMINDER', 'CALENDAR_EVENT_CREATED', 'CALENDAR_EVENT_UPDATED'];
      } else if (filter === 'updates') {
        filters.type = ['NOTE_SHARED', 'NOTE_COMMENT', 'WORKSPACE_INVITE', 'SYSTEM_UPDATE'];
      }
      
      const data = await getAllNotifications(filters);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to archive:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.actions?.[0]?.url) {
      navigate(notification.actions[0].url);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, filter]);

  useEffect(() => {
    loadUnreadCount();
    startNotificationPolling(setUnreadCount, 30000);

    return () => {
      stopNotificationPolling();
    };
  }, []);

  const getNotificationIcon = (type: NotificationType) => {
    if (type.startsWith('CALENDAR')) return <Calendar size={18} className="text-blue-500" />;
    if (type.startsWith('NOTE')) return <FileText size={18} className="text-green-500" />;
    if (type.startsWith('WORKSPACE')) return <Users size={18} className="text-purple-500" />;
    if (type.startsWith('SYSTEM')) return <SettingsIcon size={18} className="text-gray-500" />;
    return <Bell size={18} className="text-gray-500" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-blue-500';
      default: return 'border-l-gray-300';
    }
  };

  // Calculate left position based on sidebar state
  const sidebarWidth = collapsed ? 100 : 232;

  return (
    <>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className={`flex items-center ${
          collapsed ? "justify-center" : "gap-2"
        } w-full px-2 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors relative ${
          open ? 'bg-muted text-foreground' : ''
        }`}
      >
        <Bell size={16} />
        <span className={`${collapsed ? "hidden" : "inline font-medium"}`}>
          Notification
        </span>
        
        {unreadCount > 0 && (
          <span className={`absolute ${
            collapsed ? "top-0 right-0" : "right-2 top-1/2 -translate-y-1/2"
          } bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popup Panel - Using React Portal (NO BACKDROP) */}
      {open && createPortal(
        <div
          ref={popupRef}
          className="fixed top-0 bottom-0 bg-background border-r border-border flex flex-col"
          style={{
            left: `${sidebarWidth}px`,
            width: '380px',
            height: '100vh',
            zIndex: 40,
            animation: 'slideInFromLeft 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <Bell size={18} className="text-foreground" />
              <h3 className="font-semibold text-base text-foreground">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full min-w-[18px] text-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 px-2.5 py-1 hover:bg-muted rounded transition-colors flex items-center gap-1"
                >
                  <CheckCheck size={13} />
                  <span>Mark all</span>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex-shrink-0 flex items-center gap-1.5 px-5 py-2.5 border-b border-border bg-card/50">
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              { key: 'calendar', label: 'Calendar' },
              { key: 'updates', label: 'Updates' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
                  filter === tab.key
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full"></div>
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mb-3">
                  <Bell size={28} className="text-muted-foreground/40" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  No notifications
                </h3>
                <p className="text-sm text-muted-foreground">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group relative flex gap-3.5 px-5 py-3.5 hover:bg-muted/60 cursor-pointer transition-colors border-l-[3px] ${
                      getPriorityColor(notification.priority)
                    } ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <h4 className="font-medium text-[13px] text-foreground line-clamp-2 leading-snug">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                        )}
                      </div>
                      <p className="text-[13px] text-muted-foreground line-clamp-2 mb-1.5 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground/80">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {notification.priority !== 'low' && (
                          <>
                            <span className="text-xs text-muted-foreground/50">•</span>
                            <span className="text-xs text-muted-foreground/80 capitalize">
                              {notification.priority}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="p-1.5 hover:bg-background rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check size={15} className="text-green-600 dark:text-green-400" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(notification.id);
                        }}
                        className="p-1.5 hover:bg-background rounded transition-colors"
                        title="Archive"
                      >
                        <Trash2 size={15} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="flex-shrink-0 px-5 py-3 border-t border-border bg-card/30">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setOpen(false);
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium py-2 hover:bg-muted rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View all notifications</span>
                <span>→</span>
              </button>
            </div>
          )}

          {/* CSS Animation */}
          <style>{`
            @keyframes slideInFromLeft {
              from {
                opacity: 0;
                transform: translateX(-20px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>
        </div>,
        document.body
      )}
    </>
  );
}