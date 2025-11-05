import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Plus, Search, Filter, Download, Upload, Archive, 
  Trash2, Eye, Edit, Calendar, Clock, Car
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import { formatPrice } from '../../utils/timer';

const LotsList = () => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLots, setSelectedLots] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    make: 'all',
    year: 'all',
    isWeeklyDrop: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  const { hasPermission, getApiClient } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    fetchLots();
  }, [filters, pagination.page]);

  const fetchLots = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || '',
        status: filters.status === 'all' ? undefined : filters.status,
        make: filters.make === 'all' ? undefined : filters.make,
        year: filters.year === 'all' ? undefined : filters.year,
        isWeeklyDrop: filters.isWeeklyDrop === 'all' ? undefined : filters.isWeeklyDrop
      };

      const response = await api.get('/api/admin/lots', { params });
      
      setLots(response.data.items || []);
      setPagination(prev => ({ ...prev, total: response.data.total || 0 }));
    } catch (error) {
      console.error('Failed to fetch lots:', error);
      setLots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSelectLot = (lotId, checked) => {
    setSelectedLots(prev => 
      checked 
        ? [...prev, lotId]
        : prev.filter(id => id !== lotId)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedLots(checked ? lots.map(lot => lot.id) : []);
  };

  const handleBatchAction = async (action) => {
    if (selectedLots.length === 0) return;

    const confirmMessage = `Применить действие "${action}" к ${selectedLots.length} лотам?`;
    if (!confirm(confirmMessage)) return;

    try {
      const api = getApiClient();
      await api.post(`/api/admin/lots/batch/${action}`, {
        lotIds: selectedLots
      });
      
      fetchLots();
      setSelectedLots([]);
    } catch (error) {
      console.error(`Batch ${action} failed:`, error);
      alert(`Error performing action: ${error.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: t('admin.status.draft') },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: t('admin.status.scheduled') },
      published: { color: 'bg-green-100 text-green-800', label: t('admin.status.published') },
      archived: { color: 'bg-yellow-100 text-yellow-800', label: t('admin.status.archived') },
      deleted: { color: 'bg-red-100 text-red-800', label: t('admin.status.deleted') }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const mockLots = [
    {
      id: 'lot-1',
      slug: '2024-honda-accord-lx-cv123',
      status: 'published',
      make: 'Honda',
      model: 'Accord',
      year: 2024,
      trim: 'LX',
      msrp: 28900,
      discount: 3100,
      isWeeklyDrop: true,
      updatedAt: '2025-01-10T10:30:00Z',
      images: [{ url: 'https://example.com/accord.jpg' }]
    },
    {
      id: 'lot-2', 
      slug: '2025-kia-niro-ev-wind-ab456',
      status: 'draft',
      make: 'Kia',
      model: 'Niro EV',
      year: 2025,
      trim: 'Wind FWD',
      msrp: 41225,
      discount: 5725,
      isWeeklyDrop: false,
      updatedAt: '2025-01-10T09:15:00Z',
      images: [{ url: 'https://example.com/niro.jpg' }]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.lots.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('admin.lots.total_lots')}: {pagination.total}
          </p>
        </div>
        
        {hasPermission('editor') && (
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link to="/admin/lots/new">
              <Plus className="w-4 h-4 mr-2" />
              {t('admin.lots.create_new')}
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t('admin.lots.search_placeholder')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('admin.lots.filter_status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="draft">Черновики</SelectItem>
              <SelectItem value="scheduled">Запланированные</SelectItem>
              <SelectItem value="published">Опубликованные</SelectItem>
              <SelectItem value="archived">Архивированные</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.make} onValueChange={(value) => handleFilterChange('make', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('admin.lots.filter_make')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все марки</SelectItem>
              <SelectItem value="Honda">Honda</SelectItem>
              <SelectItem value="Toyota">Toyota</SelectItem>
              <SelectItem value="Kia">Kia</SelectItem>
              <SelectItem value="Hyundai">Hyundai</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('admin.lots.filter_year')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все годы</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.isWeeklyDrop} onValueChange={(value) => handleFilterChange('isWeeklyDrop', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('admin.lots.filter_weekly_drop')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все</SelectItem>
              <SelectItem value="true">Дроп недели</SelectItem>
              <SelectItem value="false">Обычные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedLots.length > 0 && hasPermission('editor') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {t('admin.lots.selected_lots')}: {selectedLots.length}
            </span>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBatchAction('publish')}
              >
                {t('admin.lots.publish_selected')}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBatchAction('archive')}
              >
                <Archive className="w-4 h-4 mr-1" />
                {t('admin.lots.archive_selected')}
              </Button>
              {hasPermission('admin') && (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => handleBatchAction('delete')}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {t('admin.lots.delete_selected')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedLots.length === lots.length && lots.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Автомобиль</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Дроп недели</TableHead>
              <TableHead>Обновлен</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : lots.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Лоты не найдены</p>
                </TableCell>
              </TableRow>
            ) : (
              lots.map((lot) => (
                <TableRow key={lot.id} data-admin-lot-row>
                  <TableCell>
                    <Checkbox
                      checked={selectedLots.includes(lot.id)}
                      onCheckedChange={(checked) => handleSelectLot(lot.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {lot.images?.[0] && (
                        <img 
                          src={lot.images[0].url} 
                          alt={`${lot.year} ${lot.make} ${lot.model}`}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">
                          {lot.year} {lot.make} {lot.model}
                        </div>
                        <div className="text-sm text-gray-500">{lot.trim}</div>
                        <div className="text-xs text-gray-400">{lot.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(lot.status)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-semibold">{formatPrice(lot.msrp - lot.discount)}</div>
                      {lot.discount > 0 && (
                        <div className="text-sm text-green-600">
                          -{formatPrice(Math.abs(lot.discount))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lot.isWeeklyDrop ? (
                      <Badge className="bg-red-100 text-red-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Дроп
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {new Date(lot.updatedAt).toLocaleDateString('ru-RU')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/car/${lot.slug}`} target="_blank">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      {hasPermission('editor') && (
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/admin/lots/${lot.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Предыдущая
          </Button>
          <span className="text-sm text-gray-600">
            Страница {pagination.page} из {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Следующая
          </Button>
        </div>
      )}
    </div>
  );
};

export default LotsList;