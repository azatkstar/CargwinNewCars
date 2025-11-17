import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { TrendingUp, Users, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../hooks/useAuth';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const { getApiClient } = useAuth();

  useEffect(() => {
    calculateAnalytics();
  }, []);

  const calculateAnalytics = async () => {
    try {
      const api = getApiClient();
      const appsResponse = await api.get('/api/admin/applications');
      const apps = appsResponse.data.applications || [];

      // Calculate metrics
      const total = apps.length;
      const approved = apps.filter(a => a.status === 'approved').length;
      const rejected = apps.filter(a => a.status === 'rejected').length;
      const pending = apps.filter(a => a.status === 'pending').length;
      
      const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0;
      
      // By credit tier
      const tier1 = apps.filter(a => a.prescoring_data?.credit_tier === 'Tier 1').length;
      const tier2 = apps.filter(a => a.prescoring_data?.credit_tier === 'Tier 2').length;
      const tier3 = apps.filter(a => a.prescoring_data?.credit_tier === 'Tier 3').length;
      
      // Approval by tier
      const tier1Approved = apps.filter(a => a.prescoring_data?.credit_tier === 'Tier 1' && a.status === 'approved').length;
      const tier2Approved = apps.filter(a => a.prescoring_data?.credit_tier === 'Tier 2' && a.status === 'approved').length;
      const tier3Approved = apps.filter(a => a.prescoring_data?.credit_tier === 'Tier 3' && a.status === 'approved').length;
      
      const tier1Rate = tier1 > 0 ? ((tier1Approved / tier1) * 100).toFixed(0) : 0;
      const tier2Rate = tier2 > 0 ? ((tier2Approved / tier2) * 100).toFixed(0) : 0;
      const tier3Rate = tier3 > 0 ? ((tier3Approved / tier3) * 100).toFixed(0) : 0;
      
      // Average income
      const totalIncome = apps.reduce((sum, a) => sum + (a.user_data?.annual_income || 0), 0);
      const avgIncome = total > 0 ? Math.round(totalIncome / total) : 0;
      
      // With trade-in
      const withTradeIn = apps.filter(a => a.trade_in).length;

      setAnalytics({
        total,
        approved,
        rejected,
        pending,
        approvalRate,
        tier1, tier2, tier3,
        tier1Rate, tier2Rate, tier3Rate,
        avgIncome,
        withTradeIn
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  if (!analytics) return <div className="text-center py-8">Loading analytics...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Performance metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.total}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-3xl font-bold text-green-600">{analytics.approvalRate}%</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Income</p>
                <p className="text-2xl font-bold text-gray-900">${(analytics.avgIncome / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="w-10 h-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Trade-In</p>
                <p className="text-3xl font-bold text-purple-600">{analytics.withTradeIn}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval by Credit Tier */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Rate by Credit Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Tier 1 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Tier 1 (740+)</span>
                <span className="text-gray-600">{analytics.tier1Rate}% approved</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-green-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${analytics.tier1Rate}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{analytics.tier1} applications</p>
            </div>

            {/* Tier 2 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Tier 2 (680-739)</span>
                <span className="text-gray-600">{analytics.tier2Rate}% approved</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${analytics.tier2Rate}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{analytics.tier2} applications</p>
            </div>

            {/* Tier 3 */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Tier 3 (640-679)</span>
                <span className="text-gray-600">{analytics.tier3Rate}% approved</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-yellow-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${analytics.tier3Rate}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{analytics.tier3} applications</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-600">{analytics.pending}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((analytics.pending / analytics.total) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{analytics.approved}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((analytics.approved / analytics.total) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-600">{analytics.rejected}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((analytics.rejected / analytics.total) * 100).toFixed(0)}% of total
            </p>


      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Pie Chart - Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pending', value: analytics.pending, color: '#f59e0b' },
                    { name: 'Approved', value: analytics.approved, color: '#10b981' },
                    { name: 'Rejected', value: analytics.rejected, color: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'Pending', value: analytics.pending, color: '#f59e0b' },
                    { name: 'Approved', value: analytics.approved, color: '#10b981' },
                    { name: 'Rejected', value: analytics.rejected, color: '#ef4444' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Credit Tiers */}
        <Card>
          <CardHeader>
            <CardTitle>Applications by Credit Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  { tier: 'Tier 1 (740+)', applications: analytics.tier1, approvalRate: analytics.tier1Rate },
                  { tier: 'Tier 2 (680-739)', applications: analytics.tier2, approvalRate: analytics.tier2Rate },
                  { tier: 'Tier 3 (640-679)', applications: analytics.tier3, approvalRate: analytics.tier3Rate }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tier" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="approvalRate" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
