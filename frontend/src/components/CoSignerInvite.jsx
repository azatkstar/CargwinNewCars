import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { UserPlus, Send, CheckCircle } from 'lucide-react';

const CoSignerInvite = ({ applicationId }) => {
  const [coSignerPhone, setCoSignerPhone] = useState('');
  const [sent, setSent] = useState(false);

  const handleSendInvite = async () => {
    if (!coSignerPhone) return;

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${BACKEND_URL}/api/applications/${applicationId}/invite-cosigner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone: coSignerPhone })
      });

      if (response.ok) {
        setSent(true);
        setTimeout(() => {
          setSent(false);
          setCoSignerPhone('');
        }, 3000);
      }
    } catch (error) {
      console.error('Co-signer invite error:', error);
      alert('Failed to send invite');
    }
  };

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-purple-600" />
          Add Co-Signer
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Customer needs co-signer for approval
        </p>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="font-semibold text-green-900">SMS Invite Sent!</p>
            <p className="text-sm text-gray-600">Co-signer will receive link to complete profile</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Co-Signer Phone Number</label>
              <Input
                type="tel"
                placeholder="(XXX) XXX-XXXX"
                value={coSignerPhone}
                onChange={(e) => setCoSignerPhone(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSendInvite}
              disabled={!coSignerPhone}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send SMS Invite
            </Button>
            <p className="text-xs text-gray-500">
              Co-signer will receive SMS with secure link to add their info. 
              Data auto-attaches to this application.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoSignerInvite;
