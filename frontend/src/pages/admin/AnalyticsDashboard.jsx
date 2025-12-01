import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { TrendingUp, Users, CheckCircle, Clock, DollarSign, Package, Calendar } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AnalyticsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [topBrands, setTopBrands] = useState([]);
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [overviewRes, topRes, distRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/analytics/overview`, { headers }),
        fetch(`${BACKEND_URL}/api/admin/analytics/top-brands-models?limit=10`, { headers }),
        fetch(`${BACKEND_URL}/api/admin/analytics/distribution`, { headers })
      ]);

      const overviewData = await overviewRes.json();
      const topData = await topRes.json();
      const distData = await distRes.json();

      setOverview(overviewData);
      setTopBrands(topData.items || []);
      setDistribution(distData);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Featured Deals metrics and insights</p>
        </div>
        <Button onClick={loadAnalytics} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {overview?.total_deals || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Deals</div>
              </div>
              <Package className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  ${(overview?.avg_payment || 0).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Avg Payment/mo</div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">
                  ${(overview?.min_payment || 0).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 mt-1">Best Deal</div>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {overview?.brands?.length || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Brands</div>
              </div>
              <Calendar className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Brands & Models */}
      <Card>
        <CardHeader>
          <CardTitle>Top Brands & Models</CardTitle>
        </CardHeader>
        <CardContent>
          {topBrands.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No data available</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Brand</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Model</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Deals</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Avg Payment</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {topBrands.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Badge>{item.brand}</Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">{item.model}</td>
                      <td className="px-4 py-3">{item.count}</td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        ${(item.avg_payment || 0).toFixed(0)}/mo
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        ${(item.min_payment || 0).toFixed(0)} - ${(item.max_payment || 0).toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* By Bank */}
        <Card>
          <CardHeader>
            <CardTitle>By Bank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {distribution?.by_bank?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="font-medium">{item.bank}</span>
                  <div className="text-right">
                    <Badge variant="secondary">{item.count}</Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      ${(item.avg_payment || 0).toFixed(0)}/mo
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Term */}
        <Card>
          <CardHeader>
            <CardTitle>By Lease Term</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {distribution?.by_term?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="font-medium">{item.term_months} months</span>
                  <div className="text-right">
                    <Badge variant="secondary">{item.count}</Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      ${(item.avg_payment || 0).toFixed(0)}/mo
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Mileage */}
        <Card>
          <CardHeader>
            <CardTitle>By Annual Mileage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {distribution?.by_mileage?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="font-medium">{(item.annual_mileage / 1000).toFixed(1)}k mi/yr</span>
                  <div className="text-right">
                    <Badge variant="secondary">{item.count}</Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      ${(item.avg_payment || 0).toFixed(0)}/mo
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
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
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
