import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Gift, Copy, Check, Share2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ReferralProgram = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Generate referral link
  const referralCode = user?.id ? btoa(user.id).slice(0, 8) : 'DEMO123';
  const referralLink = `${window.location.origin}/?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Get $200 off your next car!',
        text: 'I saved thousands on my car with CargwinNewCar. Get 10% off service fee!',
        url: referralLink
      });
    }
  };

  return (
    <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-900">
          <Gift className="w-6 h-6" />
          Refer & Earn $200
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">
          Refer a friend, family member or even a stranger to lease or finance their next vehicle and 
          <strong> earn a $200 Amazon gift card</strong>, and they get <strong>10% OFF</strong> our service fee.
        </p>

        <div className="bg-white rounded-lg p-4 border border-yellow-200 mb-4">
          <div className="text-sm text-gray-600 mb-2">Your referral link:</div>
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="flex-1 bg-gray-50"
            />
            <Button
              onClick={handleCopy}
              variant="outline"
              className="flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-shrink-0"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white rounded p-3 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">$200</div>
            <div className="text-xs text-gray-600">You Earn</div>
          </div>
          <div className="bg-white rounded p-3 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">10%</div>
            <div className="text-xs text-gray-600">Friend Saves</div>
          </div>
          <div className="bg-white rounded p-3 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">∞</div>
            <div className="text-xs text-gray-600">Unlimited</div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Real referrals. Real rewards. Real simple.
        </p>
      </CardContent>
    </Card>
  );
};

export default ReferralProgram;
