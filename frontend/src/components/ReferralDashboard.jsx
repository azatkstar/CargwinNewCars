import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Gift, DollarSign, Users, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ReferralDashboard = () => {
  const [stats, setStats] = useState(null);
  const { getApiClient } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const api = getApiClient();
      const response = await api.get('/api/referrals/my-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
    }
  };

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.total_referrals}</div>
            <div className="text-xs text-gray-600">Total Referrals</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">${stats.total_earned}</div>
            <div className="text-xs text-gray-600">Total Earned</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <Gift className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">${stats.pending_earnings}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.referrals && stats.referrals.length > 0 ? (
            <div className="space-y-3">
              {stats.referrals.map((ref, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{ref.email}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(ref.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      ref.status === 'paid' ? 'bg-green-100 text-green-700' :
                      ref.status === 'qualified' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {ref.status}
                    </span>
                    <span className="font-bold text-sm">${ref.reward}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No referrals yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralDashboard;
