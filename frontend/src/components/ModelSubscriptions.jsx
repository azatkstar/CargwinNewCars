import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Bell, Mail, MessageSquare, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ModelSubscriptions = ({ carMake, carModel }) => {
  const { user, getApiClient } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    makes: carMake ? [carMake] : [],
    models: carModel ? [carModel] : [],
    max_price: '',
    phone: '',
    telegram_id: '',
    notify_email: true,
    notify_sms: false,
    notify_telegram: false
  });

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      const api = getApiClient();
      const response = await api.get('/api/subscriptions');
      setSubscriptions(response.data.subscriptions || []);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    try {
      const api = getApiClient();
      const response = await api.post('/api/subscriptions', {
        makes: formData.makes,
        models: formData.models,
        max_price: formData.max_price ? parseInt(formData.max_price) : null,
        phone: formData.phone || null,
        telegram_id: formData.telegram_id || null,
        notify_email: formData.notify_email,
        notify_sms: formData.notify_sms,
        notify_telegram: formData.notify_telegram
      });

      if (response.data.ok) {
        alert(response.data.message);
        setShowForm(false);
        fetchSubscriptions();
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to subscribe: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleUnsubscribe = async (subId) => {
    if (!confirm('Unsubscribe from these alerts?')) return;

    try {
      const api = getApiClient();
      await api.delete(`/api/subscriptions/${subId}`);
      fetchSubscriptions();
    } catch (error) {
      console.error('Unsubscribe error:', error);
      alert('Failed to unsubscribe');
    }
  };

  if (!user) return null;

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Model Alerts
          </CardTitle>
          {!showForm && (
            <Button
              size="sm"
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              + Subscribe
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Get notified when new {carMake} {carModel} listings appear or prices drop
        </p>
      </CardHeader>
      <CardContent>
        {/* Existing Subscriptions */}
        {subscriptions.length > 0 && (
          <div className="space-y-2 mb-4">
            {subscriptions.map(sub => (
              <div key={sub.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {sub.makes?.join(', ')} {sub.models?.join(', ')}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {sub.notify_email && <Badge variant="outline" className="text-xs"><Mail className="w-3 h-3 mr-1" />Email</Badge>}
                    {sub.notify_sms && <Badge variant="outline" className="text-xs"><MessageSquare className="w-3 h-3 mr-1" />SMS</Badge>}
                    {sub.notify_telegram && <Badge variant="outline" className="text-xs">📱 Telegram</Badge>}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUnsubscribe(sub.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Subscribe Form */}
        {showForm && (
          <form onSubmit={handleSubscribe} className="space-y-4 border-t pt-4">
            <div>
              <Label>Max Price (optional)</Label>
              <Input
                type="number"
                placeholder="e.g., 25000"
                value={formData.max_price}
                onChange={(e) => setFormData({...formData, max_price: e.target.value})}
              />
              <p className="text-xs text-gray-500 mt-1">
                Only notify if price is below this amount
              </p>
            </div>

            <div className="space-y-3">
              <Label>Notification Methods:</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify-email"
                  checked={formData.notify_email}
                  onCheckedChange={(checked) => setFormData({...formData, notify_email: checked})}
                />
                <label htmlFor="notify-email" className="text-sm cursor-pointer">
                  📧 Email ({user.email})
                </label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify-sms"
                    checked={formData.notify_sms}
                    onCheckedChange={(checked) => setFormData({...formData, notify_sms: checked})}
                  />
                  <label htmlFor="notify-sms" className="text-sm cursor-pointer">
                    📱 SMS
                  </label>
                </div>
                {formData.notify_sms && (
                  <Input
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notify-telegram"
                    checked={formData.notify_telegram}
                    onCheckedChange={(checked) => setFormData({...formData, notify_telegram: checked})}
                  />
                  <label htmlFor="notify-telegram" className="text-sm cursor-pointer">
                    📲 Telegram
                  </label>
                </div>
                {formData.notify_telegram && (
                  <Input
                    placeholder="Telegram username"
                    value={formData.telegram_id}
                    onChange={(e) => setFormData({...formData, telegram_id: e.target.value})}
                  />
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Subscribe
              </Button>
            </div>
          </form>
        )}

        {subscriptions.length === 0 && !showForm && (
          <p className="text-sm text-gray-500 text-center py-4">
            No active subscriptions
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ModelSubscriptions;
