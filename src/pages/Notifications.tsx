import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useState } from 'react';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Filter,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useRealtimeNotifications,
} from '@/hooks/useNotifications';
import toast from 'react-hot-toast';

type NotificationFilter = 'all' | 'unread' | 'close_approach' | 'threshold_breach' | 'new_hazardous';

function NotificationsContent() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [showStats, setShowStats] = useState(false);

  // Enable realtime notifications
  useRealtimeNotifications();

  const handleMarkRead = async (id: string) => {
    try {
      await markRead.mutateAsync(id);
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification.mutateAsync(id);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete all notifications?')) return;

    try {
      await Promise.all(notifications.map(n => deleteNotification.mutateAsync(n.id)));
      toast.success('All notifications deleted');
    } catch (error) {
      toast.error('Failed to delete all notifications');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'close_approach':
        return <AlertTriangle className="h-5 w-5 text-risk-high" />;
      case 'new_hazardous':
        return <AlertTriangle className="h-5 w-5 text-risk-critical" />;
      case 'threshold_breach':
        return <Bell className="h-5 w-5 text-cosmic-pink" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    return n.notification_type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Calculate statistics
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    closeApproach: notifications.filter(n => n.notification_type === 'close_approach').length,
    thresholdBreach: notifications.filter(n => n.notification_type === 'threshold_breach').length,
    newHazardous: notifications.filter(n => n.notification_type === 'new_hazardous').length,
  };

  return (
    <div className="min-h-screen">
      <div className="stars" />
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowStats(!showStats)}
              variant="outline"
              size="sm"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              {showStats ? 'Hide' : 'Show'} Stats
            </Button>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
                variant="outline"
                size="sm"
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark All Read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                onClick={handleDeleteAll}
                disabled={deleteNotification.isPending}
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All
              </Button>
            )}
          </div>
        </motion.div>

        {/* Statistics Panel */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
          >
            <div className="bg-card-gradient rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-card-gradient rounded-xl p-4 border border-primary/30">
              <p className="text-sm text-muted-foreground mb-1">Unread</p>
              <p className="text-2xl font-bold text-primary">{stats.unread}</p>
            </div>
            <div className="bg-card-gradient rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Close Approach</p>
              <p className="text-2xl font-bold text-risk-high">{stats.closeApproach}</p>
            </div>
            <div className="bg-card-gradient rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Threshold</p>
              <p className="text-2xl font-bold text-cosmic-pink">{stats.thresholdBreach}</p>
            </div>
            <div className="bg-card-gradient rounded-xl p-4 border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">New Hazardous</p>
              <p className="text-2xl font-bold text-risk-critical">{stats.newHazardous}</p>
            </div>
          </motion.div>
        )}

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            <Filter className="mr-2 h-4 w-4" />
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === 'close_approach' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('close_approach')}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Close Approach
          </Button>
          <Button
            variant={filter === 'threshold_breach' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('threshold_breach')}
          >
            <Bell className="mr-2 h-4 w-4" />
            Threshold Breach
          </Button>
          <Button
            variant={filter === 'new_hazardous' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('new_hazardous')}
          >
            New Hazardous
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-card-gradient rounded-xl border border-border/50"
          >
            <BellOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-bold mb-2">
              {filter === 'all' ? 'No Notifications Yet' : `No ${filter.replace('_', ' ')} notifications`}
            </h3>
            <p className="text-muted-foreground mb-6">
              {filter === 'all'
                ? "You'll receive notifications about close approaches and hazardous asteroids."
                : 'Try selecting a different filter to view other notifications.'}
            </p>
            <Link to="/watched">
              <Button className="bg-hero-gradient hover:shadow-glow-purple">
                Manage Watchlist
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`bg-card-gradient rounded-xl p-5 border transition-all ${notification.is_read
                    ? 'border-border/50 opacity-70'
                    : 'border-primary/30 shadow-glow-purple/10'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                    {getNotificationIcon(notification.notification_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold">{notification.title}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(notification.created_at), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      {notification.neo_id && (
                        <Link to={`/asteroid/${notification.neo_id}`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View Asteroid
                          </Button>
                        </Link>
                      )}
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkRead(notification.id)}
                          disabled={markRead.isPending}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        disabled={deleteNotification.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Notifications() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
