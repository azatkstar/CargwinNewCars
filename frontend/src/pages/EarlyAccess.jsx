import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Bell, Mail, MessageSquare, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const EarlyAccess = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    brands: [],
    maxBudget: '',
    notifyEmail: true,
    notifySMS: false,
    notifyTelegram: false
  });
  const [submitted, setSubmitted] = useState(false);

  const brands = ['Lexus', 'Genesis', 'BMW', 'Mercedes-Benz', 'Audi', 'Toyota', 'Honda'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/early-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-32 text-center">
          <div className="bg-white rounded-xl shadow-lg p-12">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">You're In! 🎉</h1>
            <p className="text-lg text-gray-600 mb-4">
              You'll get dump offers 2-4 hours before everyone else.
            </p>
            <p className="text-sm text-gray-500">
              Watch your {formData.notifyEmail ? 'email' : formData.notifySMS ? 'phone' : 'inbox'} for the next drop.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Bell className="w-4 h-4" />
            EARLY ACCESS
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Get Deals 2-4 Hours Early
          </h1>
          <p className="text-xl text-gray-600">
            New dump offers drop monthly. Be first in line.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border-2 border-gray-200 text-center">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="font-bold mb-2">First Access</h3>
            <p className="text-sm text-gray-600">
              See new offers 2-4 hours before public
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border-2 border-gray-200 text-center">
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="font-bold mb-2">Personalized</h3>
            <p className="text-sm text-gray-600">
              Only brands and budgets you want
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border-2 border-gray-200 text-center">
            <div className="text-4xl mb-2">📱</div>
            <h3 className="font-bold mb-2">Multi-Channel</h3>
            <p className="text-sm text-gray-600">
              Email, SMS, or Telegram - your choice
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign Up for Early Access</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Free forever. Unsubscribe anytime. No spam.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="text-sm font-medium mb-2 block">Email *</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium mb-2 block">Phone (optional)</label>
                <Input
                  type="tel"
                  placeholder="(XXX) XXX-XXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">For SMS alerts</p>
              </div>

              {/* Brands */}
              <div>
                <label className="text-sm font-medium mb-2 block">Interested Brands</label>
                <div className="grid grid-cols-2 gap-3">
                  {brands.map(brand => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={brand}
                        checked={formData.brands.includes(brand)}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            brands: checked 
                              ? [...formData.brands, brand]
                              : formData.brands.filter(b => b !== brand)
                          });
                        }}
                      />
                      <label htmlFor={brand} className="text-sm cursor-pointer">
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Max Budget */}
              <div>
                <label className="text-sm font-medium mb-2 block">Max Monthly Budget</label>
                <Input
                  type="number"
                  placeholder="e.g., 800"
                  value={formData.maxBudget}
                  onChange={(e) => setFormData({...formData, maxBudget: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only notify me if monthly payment is below this
                </p>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-3 border-t pt-4">
                <label className="text-sm font-medium block">Notify me via:</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-notif"
                    checked={formData.notifyEmail}
                    onCheckedChange={(c) => setFormData({...formData, notifyEmail: c})}
                  />
                  <label htmlFor="email-notif" className="text-sm cursor-pointer">
                    📧 Email
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sms-notif"
                    checked={formData.notifySMS}
                    onCheckedChange={(c) => setFormData({...formData, notifySMS: c})}
                  />
                  <label htmlFor="sms-notif" className="text-sm cursor-pointer">
                    📱 SMS
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tg-notif"
                    checked={formData.notifyTelegram}
                    onCheckedChange={(c) => setFormData({...formData, notifyTelegram: c})}
                  />
                  <label htmlFor="tg-notif" className="text-sm cursor-pointer">
                    📲 Telegram
                  </label>
                </div>
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-lg py-6">
                Get Early Access
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By signing up, you agree to receive promotional emails. Unsubscribe anytime.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Why Early Access */}
        <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-lg text-blue-900 mb-3">
            Why Early Access Matters
          </h3>
          <p className="text-gray-700 mb-4">
            Dump offers are time-sensitive. The best deals sell within hours of being posted. 
            Early access gives you a 2-4 hour head start to review and book before the general public.
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Best selection before cars sell out</li>
            <li>✓ More time to decide without pressure</li>
            <li>✓ Higher approval chances (fewer applications ahead of you)</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EarlyAccess;
