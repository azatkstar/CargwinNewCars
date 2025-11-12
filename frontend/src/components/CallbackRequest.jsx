import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Phone, Clock } from 'lucide-react';

const CallbackRequest = () => {
  const [phone, setPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState('asap');
  const [submitted, setSubmitted] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${BACKEND_URL}/api/callback-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone, preferred_time: preferredTime })
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      alert('Failed: ' + error.message);
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <Phone className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="font-bold text-green-900 mb-2">Callback Requested!</h3>
          <p className="text-sm text-gray-700">Finance Manager will call within 15 min</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Request Callback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRequest} className="space-y-3">
          <Input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <select value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="w-full p-2 border rounded">
            <option value="asap">ASAP</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
          </select>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Request Call</Button>
          <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />Avg: 12 min</p>
        </form>
      </CardContent>
    </Card>
  );
};

export default CallbackRequest;