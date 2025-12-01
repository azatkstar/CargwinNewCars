import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { RefreshCw, Play, Zap } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function AdminMultiSync() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState({});
  const [syncingAll, setSyncingAll] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/admin/sync/brands`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      setBrands(data.brands || []);
    } catch (err) {
      console.error('Error loading brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const runBrandSync = async (brand) => {
    setSyncing({ ...syncing, [brand]: true });

    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${BACKEND_URL}/api/admin/sync/run-brand?brand=${brand}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setTimeout(() => {
        loadBrands();
        setSyncing({ ...syncing, [brand]: false });
      }, 2000);
    } catch (err) {
      console.error('Sync error:', err);
      setSyncing({ ...syncing, [brand]: false });
    }
  };

  const runAllSyncs = async () => {
    setSyncingAll(true);

    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${BACKEND_URL}/api/admin/sync/run-all-brands`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setTimeout(() => {
        loadBrands();
        setSyncingAll(false);
      }, 3000);
    } catch (err) {
      console.error('Run all error:', err);
      setSyncingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Multi-Brand Sync</h1>
          <p className="text-gray-600">Manage AutoSync per manufacturer</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadBrands} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={runAllSyncs}
            disabled={syncingAll}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {syncingAll ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running All...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Run All Syncs
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brands ({brands.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Brand</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Programs</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Deals</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Last Sync</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {brands.map(brand => (
                    <tr key={brand.brand} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-semibold">{brand.brand}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{brand.programs_count}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge>{brand.deals_count}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {brand.last_sync_time
                          ? new Date(brand.last_sync_time).toLocaleString()
                          : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={brand.status === 'ok' ? 'default' : 'secondary'}
                        >
                          {brand.status === 'ok' ? 'Ready' : 'No Programs'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => runBrandSync(brand.brand)}
                            disabled={syncing[brand.brand] || brand.status !== 'ok'}
                          >
                            {syncing[brand.brand] ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-1" />
                                Sync
                              </>
                            )}
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
