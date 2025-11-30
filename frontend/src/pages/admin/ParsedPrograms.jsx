import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Trash2, Eye, RefreshCw } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function ParsedPrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ brand: '', model: '' });

  const loadPrograms = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (filter.brand) params.append('brand', filter.brand);
      if (filter.model) params.append('model', filter.model);

      const response = await fetch(
        `${BACKEND_URL}/api/admin/lease-programs/parsed?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const data = await response.json();
      setPrograms(data.items || []);
    } catch (err) {
      console.error('Error loading programs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this program?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${BACKEND_URL}/api/admin/lease-programs/parsed/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      loadPrograms();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Parsed Lease Programs</h1>
          <p className="text-gray-600">Manage extracted lease programs from PDFs</p>
        </div>
        <Link to="/admin/upload-pdf">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Upload New PDF
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Filter by brand..."
              value={filter.brand}
              onChange={(e) => setFilter({ ...filter, brand: e.target.value })}
            />
            <Input
              placeholder="Filter by model..."
              value={filter.model}
              onChange={(e) => setFilter({ ...filter, model: e.target.value })}
            />
            <Button onClick={loadPrograms}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Programs ({programs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : programs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No programs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Brand</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Model</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Month</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">MF</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">RV</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {programs.map(program => (
                    <tr key={program.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Badge>{program.brand}</Badge>
                      </td>
                      <td className="px-4 py-3">{program.model || '-'}</td>
                      <td className="px-4 py-3 text-sm">{program.month || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        {Object.keys(program.mf || {}).join(', ') || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {Object.keys(program.residual || {}).join(', ') || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(program.id)}
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
