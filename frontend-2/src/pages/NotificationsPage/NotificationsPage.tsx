// pages/NotificationsPage/NotificationsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layout/sidebar/sidebar';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Calendar, 
  FileText, 
  Users, 
  Settings as SettingsIcon,
  Filter,
  Search
} from 'lucide-react';
import { 
  getAllNotifications, 
  getNotificationStats,
  markAsRead, 
  markAllAsRead,
  archiveNotification
} from '@/services/notificationService';
import type { Notification, NotificationType, NotificationStats } from '@/types/notification';
import { formatDistanceToNow, format } from 'date-fns';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'calendar' | 'updates'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Load notifications
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const filters: any = { limit: 100 };
      
      if (filter === 'unread') {
        filters.isRead = false;
      } else if (filter === 'calendar') {
        filters.type = ['CALENDAR_REMINDER', 'CALENDAR_EVENT_CREATED', 'CALENDAR_EVENT_UPDATED'];
      } else if (filter === 'updates') {
        filters.type = ['NOTE_SHARED', 'NOTE_COMMENT', 'WORKSPACE_INVITE', 'SYSTEM_UPDATE'];
      }
      
      const [notifData, statsData] = await Promise.all([
        getAllNotifications(filters),
        getNotificationStats()
      ]);
      
      setNotifications(notifData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  // Filter by search
  const filteredNotifications = notifications.filter(n =>
    searchQuery === '' ||
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle mark as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Handle archive
  const handleArchive = async (id: string) => {
    try {
      await archiveNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      loadNotifications();
    } catch (error) {
      console.error('Failed to archive:', error);
    }
  };

  // Handle bulk archive
  const handleBulkArchive = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => archiveNotification(id)));
      setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
      setSelectedIds(new Set());
      loadNotifications();
    } catch (error) {
      console.error('Failed to bulk archive:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.actions?.[0]?.url) {
      navigate(notification.actions[0].url);
    }
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType) => {
    if (type.startsWith('CALENDAR')) return <Calendar size={20} className="text-blue-500" />;
    if (type.startsWith('NOTE')) return <FileText size={20} className="text-green-500" />;
    if (type.startsWith('WORKSPACE')) return <Users size={20} className="text-purple-500" />;
    if (type.startsWith('SYSTEM')) return <SettingsIcon size={20} className="text-gray-500" />;
    return <Bell size={20} className="text-gray-500" />;
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-blue-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        collapsed ? 'ml-25' : 'ml-58'
      }`}>
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Notifications
                </h1>
                {stats && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.unread} unread of {stats.total} total
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {selectedIds.size > 0 && (
                  <button
                    onClick={handleBulkArchive}
                    className="px-4 py-2 text-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Archive {selectedIds.size}
                  </button>
                )}
                {stats && stats.unread > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-2"
                  >
                    <CheckCheck size={16} />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-muted-foreground" />
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: 'calendar', label: 'Calendar' },
                  { key: 'updates', label: 'Updates' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                      filter === tab.key
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell size={64} className="mx-auto mb-4 text-muted-foreground opacity-30" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No notifications
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try a different search term' : "You're all caught up!"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-card border border-border rounded-lg hover:shadow-md transition-all cursor-pointer border-l-4 ${
                      getPriorityColor(notification.priority)
                    } ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="p-4 flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedIds.has(notification.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelection(notification.id);
                        }}
                        className="mt-1 h-4 w-4 text-primary rounded border-border focus:ring-primary"
                      />

                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <h3 className="font-semibold text-foreground">
                            {notification.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded">
                                New
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{notification.priority} priority</span>
                          <span>•</span>
                          <span>{format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <CheckCheck size={18} className="text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(notification.id);
                          }}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Archive"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}