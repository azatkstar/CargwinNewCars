import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Trash2, Eye, Plus } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function FeaturedDealsAdmin() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadDeals = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/deals/list?limit=100`);
      const data = await response.json();
      setDeals(data.deals || []);
    } catch (err) {
      console.error('Error loading deals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this deal?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${BACKEND_URL}/api/deals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      loadDeals();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Featured Deals</h1>
          <p className="text-gray-600">Manage showcased lease deals</p>
        </div>
        <Button
          onClick={() => navigate('/admin/featured-deals/create')}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Deal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deals ({deals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No deals created yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Vehicle</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Payment</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Drive-Off</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {deals.map(deal => (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold">
                          {deal.year} {deal.brand} {deal.model}
                        </div>
                        <div className="text-sm text-gray-500">{deal.trim || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-red-600">
                          ${(deal.calculated_payment || 0).toFixed(0)}/mo
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        ${(deal.calculated_driveoff || 0).toFixed(0)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={deal.stock_count > 0 ? 'default' : 'secondary'}>
                          {deal.stock_count || 0}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(deal.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link to={`/deal/${deal.id}`} target="_blank">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(deal.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
