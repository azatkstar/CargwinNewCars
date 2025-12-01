import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { TrendingUp, DollarSign, Package, Calendar, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState(null);
  const [topBrands, setTopBrands] = useState([]);
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
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
          <RefreshCw className="w-4 h-4 mr-2" />
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
}

export default AnalyticsDashboard;
