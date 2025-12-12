import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Edit, Trash2, Plus } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function OffersManagement() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cars`);
      const data = await response.json();
      setOffers(data || []);
    } catch (err) {
      console.error('Error loading offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (offerId) => {
    if (!confirm('Удалить этот оффер?')) return;

    try {
      const token = localStorage.getItem('access_token');
      
      console.log('Deleting offer:', offerId);
      
      const response = await fetch(`${BACKEND_URL}/api/admin/offers/${offerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      console.log('Delete response:', data);

      if (data.ok) {
        alert('Offer deleted successfully');
        loadOffers();
      } else {
        alert(`Error deleting: ${data.detail || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting offer');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('⚠️ ОПАСНО! Удалить ВСЕ офферы? Это необратимо!')) return;
    if (!confirm('Вы уверены? Введённые данные потеряются навсегда!')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/admin/offers/delete-all?confirm=yes`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.ok) {
        alert(`Удалено: ${data.deleted.total} offers`);
        loadOffers();
      } else {
        alert('Error deleting all');
      }
    } catch (err) {
      console.error('Mass delete error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Управление Офферами</h1>
          <p className="text-gray-600">Редактирование офферов из scraper</p>
        </div>
        <div className="flex gap-2">
          {offers.length > 0 && (
            <Button onClick={handleDeleteAll} variant="destructive">
              🗑️ Delete All
            </Button>
          )}
          <Link to="/admin/offers/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать Оффер
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Все Офферы ({offers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : offers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Нет офферов. Запустите scraper или создайте вручную.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Make</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Model</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Year</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Payment</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Source</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {offers.map(offer => (
                    <tr key={offer.id || offer._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{offer.title || 'N/A'}</td>
                      <td className="px-4 py-3">{offer.make || offer.specs?.make || 'N/A'}</td>
                      <td className="px-4 py-3">{offer.model || offer.specs?.model || 'N/A'}</td>
                      <td className="px-4 py-3">{offer.year || offer.specs?.year || 'N/A'}</td>
                      <td className="px-4 py-3">${(offer.lease && offer.lease.monthly) || 0}/mo</td>
                      <td className="px-4 py-3">
                        <Badge variant={offer.source === 'autobandit' ? 'default' : 'secondary'}>
                          {offer.source || 'manual'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                          {offer.status || 'active'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link to={`/admin/offers/${offer.id || offer._id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(offer.id || offer._id)}
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
