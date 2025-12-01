import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Bell, CheckCheck, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/admin/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread || 0);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${BACKEND_URL}/api/admin/notifications/mark-read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      loadNotifications();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'success':
        return <CheckCheck className="w-5 h-5 text-green-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-gray-600">
            System alerts and updates
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">{unreadCount} unread</Badge>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllRead} variant="outline">
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.reverse().map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded border ${getBgColor(notif.type)} ${
                    !notif.read ? 'border-l-4' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {notif.message}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(notif.timestamp).toLocaleString()}
                      </div>
                      {notif.details && Object.keys(notif.details).length > 0 && (
                        <div className="text-xs text-gray-600 mt-2 bg-white p-2 rounded">
                          {JSON.stringify(notif.details)}
                        </div>
                      )}
                    </div>
                    {!notif.read && (
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
