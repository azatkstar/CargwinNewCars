import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mail, MessageSquare, Bell, CheckCircle } from 'lucide-react';

const NotificationHistory = ({ applicationId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (applicationId) {
      fetchNotifications();
    }
  }, [applicationId]);

  const fetchNotifications = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('access_token');

      const response = await fetch(
        `${BACKEND_URL}/api/admin/applications/${applicationId}/notifications`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (notifications.length === 0) return null;

  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notification History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notif, idx) => (
            <div key={idx} className="bg-white p-3 rounded border text-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {notif.channel === 'email' || notif.type === 'email' ? (
                    <Mail className="w-4 h-4 text-blue-600" />
                  ) : notif.channel === 'sms' || notif.type === 'sms' ? (
                    <MessageSquare className="w-4 h-4 text-green-600" />
                  ) : (
                    <Bell className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="font-medium">
                    {notif.type === 'auto_status_change' ? 'Auto Status Notification' : notif.type}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {notif.status === 'sent_mock' ? '📝 Mock' : '✓ Sent'}
                </Badge>
              </div>
              
              <p className="text-gray-700 text-xs mb-2">{notif.message}</p>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{new Date(notif.sent_at).toLocaleString()}</span>
                <span>•</span>
                <span>by {notif.sent_by || notif.triggered_by}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationHistory;
