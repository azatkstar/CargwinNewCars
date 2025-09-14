import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Save, Eye, Calendar, Archive, Trash2, RefreshCw,
  Car, DollarSign, Clock, TrendingUp, Search, Image
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import { formatPrice } from '../../utils/timer';
import MediaUploader from './MediaUploader';
import OTDPreview from './OTDPreview';

const LotForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { t } = useI18n();
  const isEditing = !!id;

  const [lot, setLot] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    trim: '',
    vin: '',
    drivetrain: 'FWD',
    engine: '',
    transmission: 'AT',
    exteriorColor: '',
    interiorColor: '',
    msrp: '',
    discount: 0,
    feesHint: 0,
    state: 'CA',
    description: '',
    tags: [],
    isWeeklyDrop: false,
    dropWindow: null,
    fomo: {
      mode: 'inherit',
      viewers: 25,
      confirms15: 5
    },
    seo: {
      title: '',
      description: '',
      noindex: false
    },
    images: [],
    status: 'draft',
    publishAt: null
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      fetchLot();
    }
  }, [id, isEditing]);

  const fetchLot = async () => {
    setLoading(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/admin/lots/${id}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setLot(data);
        console.log('Fetched lot data:', data);
      } else {
        console.error('Failed to fetch lot - server response:', response.status);
        setErrors({ general: 'Не удалось загрузить данные лота' });
      }
    } catch (error) {
      console.error('Failed to fetch lot:', error);
      setErrors({ general: 'Ошибка подключения к серверу' });
    } finally {
      setLoading(false);
    }
  };

  const validateLot = () => {
    const newErrors = {};

    if (!lot.make) newErrors.make = 'Марка обязательна';
    if (!lot.model) newErrors.model = 'Модель обязательна';
    if (lot.year < 2015 || lot.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Год должен быть между 2015 и ' + (new Date().getFullYear() + 1);
    }
    if (!lot.trim) newErrors.trim = 'Комплектация обязательна';
    if (lot.msrp < 1000) newErrors.msrp = 'MSRP должно быть не менее $1,000';
    if (lot.discount < 0) newErrors.discount = 'Скидка не может быть отрицательной';
    if (lot.discount > lot.msrp) newErrors.discount = 'Скидка не может превышать MSRP';
    if (lot.description.length < 140) newErrors.description = 'Описание должно содержать минимум 140 символов';
    if (lot.images.length === 0) newErrors.images = 'Необходимо загрузить хотя бы одно изображение';
    if (lot.vin && lot.vin.length !== 17) newErrors.vin = 'VIN должен содержать 17 символов';

    // FOMO validation
    if (lot.fomo.mode === 'static') {
      if (lot.fomo.viewers < 3) newErrors.fomoViewers = 'Минимальное значение: 3';
      if (lot.fomo.confirms15 < 3) newErrors.fomoConfirms = 'Минимальное значение: 3';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateSlug = () => {
    const slug = `${lot.year}-${lot.make}-${lot.model}-${lot.trim}-${lot.vin.slice(-5) || 'xxxxx'}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    setLot(prev => ({ ...prev, slug }));
  };

  const handleInputChange = (field, value) => {
    setLot(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setLot(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSave = async (action = 'save') => {
    if (!validateLot()) {
      // Find first tab with error and switch to it
      const errorTabs = {
        make: 'basic', model: 'basic', year: 'basic', trim: 'basic', description: 'basic',
        images: 'media',
        msrp: 'pricing', discount: 'pricing',
        fomoViewers: 'fomo', fomoConfirms: 'fomo'
      };
      
      const firstErrorField = Object.keys(errors)[0];
      const errorTab = errorTabs[firstErrorField];
      if (errorTab) setActiveTab(errorTab);
      
      return;
    }

    setSaving(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const url = isEditing ? `${BACKEND_URL}/api/admin/lots/${id}` : `${BACKEND_URL}/api/admin/lots`;
      const method = isEditing ? 'PATCH' : 'POST';
      
      const payload = { ...lot };
      if (action === 'publish') payload.status = 'published';
      if (action === 'schedule' && lot.publishAt) payload.status = 'scheduled';

      console.log('Saving lot:', payload);

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      console.log('Save response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Lot saved successfully:', data);
        
        if (action === 'publish') {
          alert('Лот успешно опубликован!');
        } else if (action === 'schedule') {
          alert('Лот запланирован к публикации!');
        } else {
          alert('Лот сохранен успешно!');
        }
        
        // Navigate back to lots list after successful save
        setTimeout(() => {
          navigate('/admin/lots');
        }, 1000);
      } else {
        const errorData = await response.json();
        console.error('Save error response:', errorData);
        throw new Error(errorData.detail || 'Ошибка сервера');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Ошибка сохранения: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      
      // If editing existing lot, create preview token for saved lot
      if (isEditing && id) {
        const response = await fetch(`${BACKEND_URL}/api/admin/lots/${id}/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const previewUrl = `/preview/${data.token}`;
          console.log('Opening preview for saved lot:', previewUrl);
          window.open(previewUrl, '_blank');
        } else {
          console.error('Failed to create preview token for saved lot');
          alert('Ошибка создания предпросмотра. Сначала сохраните лот.');
        }
      } else {
        // For new/unsaved lot, send current form data
        const response = await fetch(`${BACKEND_URL}/api/admin/lots/preview-unsaved`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(lot)
        });
        
        if (response.ok) {
          const data = await response.json();
          const previewUrl = `/preview/${data.token}`;
          console.log('Opening preview for unsaved lot:', previewUrl);
          window.open(previewUrl, '_blank');
        } else {
          console.error('Failed to create preview token for unsaved lot');
          alert('Ошибка создания предпросмотра. Проверьте данные лота.');
        }
      }
    } catch (error) {
      console.error('Preview error:', error);
      alert('Ошибка создания предпросмотра. Попробуйте позже.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Редактирование лота' : 'Создание лота'}
          </h1>
          {lot.slug && (
            <p className="text-gray-600 mt-1">Slug: {lot.slug}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={
            lot.status === 'published' ? 'bg-green-100 text-green-800' :
            lot.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }>
            {t(`admin.status.${lot.status}`)}
          </Badge>
        </div>
      </div>

      {/* Action Bar */}
      <div className="sticky top-0 z-10 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleSave('save')}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Сохранение...' : t('admin.actions.save')}
            </Button>
            
            <Button
              variant="outline"
              onClick={handlePreview}
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('admin.actions.preview')}
            </Button>
            
            {hasPermission('editor') && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSave('schedule')}
                  disabled={saving || !lot.publishAt}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('admin.actions.schedule')}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleSave('publish')}
                  disabled={saving}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  {t('admin.actions.publish')}
                </Button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing && hasPermission('editor') && (
              <Button variant="outline">
                <Archive className="w-4 h-4 mr-2" />
                {t('admin.actions.archive')}
              </Button>
            )}
            
            {isEditing && hasPermission('admin') && (
              <Button 
                variant="outline" 
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('admin.actions.delete')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="basic">{t('admin.lot_form.tabs.basic')}</TabsTrigger>
          <TabsTrigger value="media">{t('admin.lot_form.tabs.media')}</TabsTrigger>
          <TabsTrigger value="pricing">{t('admin.lot_form.tabs.pricing')}</TabsTrigger>
          <TabsTrigger value="weekly-drop">{t('admin.lot_form.tabs.weekly_drop')}</TabsTrigger>
          <TabsTrigger value="fomo">{t('admin.lot_form.tabs.fomo')}</TabsTrigger>
          <TabsTrigger value="seo">{t('admin.lot_form.tabs.seo')}</TabsTrigger>
          <TabsTrigger value="technical">{t('admin.lot_form.tabs.technical')}</TabsTrigger>
        </TabsList>

        {/* Basic Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="w-5 h-5" />
                Основная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="make">Марка *</Label>
                  <Input
                    id="make"
                    value={lot.make}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                    className={errors.make ? 'border-red-500' : ''}
                  />
                  {errors.make && <p className="text-sm text-red-600 mt-1">{errors.make}</p>}
                </div>

                <div>
                  <Label htmlFor="model">Модель *</Label>
                  <Input
                    id="model"
                    value={lot.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className={errors.model ? 'border-red-500' : ''}
                  />
                  {errors.model && <p className="text-sm text-red-600 mt-1">{errors.model}</p>}
                </div>

                <div>
                  <Label htmlFor="year">Год *</Label>
                  <Input
                    id="year"
                    type="number"
                    min="2015"
                    max={new Date().getFullYear() + 1}
                    value={lot.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    className={errors.year ? 'border-red-500' : ''}
                  />
                  {errors.year && <p className="text-sm text-red-600 mt-1">{errors.year}</p>}
                </div>

                <div>
                  <Label htmlFor="trim">Комплектация *</Label>
                  <Input
                    id="trim"
                    value={lot.trim}
                    onChange={(e) => handleInputChange('trim', e.target.value)}
                    className={errors.trim ? 'border-red-500' : ''}
                  />
                  {errors.trim && <p className="text-sm text-red-600 mt-1">{errors.trim}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="vin">VIN</Label>
                  <Input
                    id="vin"
                    value={lot.vin}
                    onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                    maxLength={17}
                    className={errors.vin ? 'border-red-500' : ''}
                  />
                  {errors.vin && <p className="text-sm text-red-600 mt-1">{errors.vin}</p>}
                </div>

                <div>
                  <Label htmlFor="drivetrain">Привод</Label>
                  <Select value={lot.drivetrain} onValueChange={(value) => handleInputChange('drivetrain', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FWD">FWD</SelectItem>
                      <SelectItem value="RWD">RWD</SelectItem>
                      <SelectItem value="AWD">AWD</SelectItem>
                      <SelectItem value="4WD">4WD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="transmission">Трансмиссия</Label>
                  <Select value={lot.transmission} onValueChange={(value) => handleInputChange('transmission', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AT">AT</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="DCT">DCT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="engine">Двигатель</Label>
                  <Input
                    id="engine"
                    value={lot.engine}
                    onChange={(e) => handleInputChange('engine', e.target.value)}
                    placeholder="1.5L Turbo I4"
                  />
                </div>

                <div>
                  <Label htmlFor="exteriorColor">Цвет кузова</Label>
                  <Input
                    id="exteriorColor"
                    value={lot.exteriorColor}
                    onChange={(e) => handleInputChange('exteriorColor', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="interiorColor">Цвет салона</Label>
                  <Input
                    id="interiorColor"
                    value={lot.interiorColor}
                    onChange={(e) => handleInputChange('interiorColor', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Описание *</Label>
                <Textarea
                  id="description"
                  value={lot.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{lot.description.length}/140 символов минимум</span>
                  {errors.description && <span className="text-red-600">{errors.description}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tags">Теги (через запятую)</Label>
                  <Input
                    id="tags"
                    value={lot.tags.join(', ')}
                    onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                    placeholder="sedan, 2024, honda"
                  />
                </div>

                <div>
                  <Label htmlFor="state">Штат</Label>
                  <Select value={lot.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateSlug}
                  disabled={!lot.make || !lot.model || !lot.year}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Сгенерировать slug
                </Button>
                {lot.slug && (
                  <Badge variant="outline" className="font-mono">
                    {lot.slug}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Медиа файлы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MediaUploader
                images={lot.images}
                onChange={(images) => handleInputChange('images', images)}
                error={errors.images}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Ценообразование
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="msrp">MSRP *</Label>
                  <Input
                    id="msrp"
                    type="number"
                    min="1000"
                    step="100"
                    placeholder="Введите MSRP"
                    value={lot.msrp || ''}
                    onChange={(e) => handleInputChange('msrp', parseInt(e.target.value) || 0)}
                    className={errors.msrp ? 'border-red-500' : ''}
                  />
                  {errors.msrp && <p className="text-sm text-red-600 mt-1">{errors.msrp}</p>}
                </div>

                <div>
                  <Label htmlFor="discount">Скидка</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    value={lot.discount}
                    onChange={(e) => handleInputChange('discount', Math.abs(parseInt(e.target.value) || 0))}
                    className={errors.discount ? 'border-red-500' : ''}
                  />
                  {errors.discount && <p className="text-sm text-red-600 mt-1">{errors.discount}</p>}
                </div>

                <div>
                  <Label htmlFor="feesHint">Известные допы в США</Label>
                  <Input
                    id="feesHint"
                    type="number"
                    min="0"
                    value={lot.feesHint}
                    onChange={(e) => handleInputChange('feesHint', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Средняя сумма навязанных допов для данной модели
                  </p>
                </div>
              </div>

              {lot.msrp > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(lot.msrp)}
                      </div>
                      <div className="text-sm text-gray-600">MSRP</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatPrice(Math.abs(lot.discount))}
                      </div>
                      <div className="text-sm text-gray-600">Скидка</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(lot.msrp - lot.discount)}
                      </div>
                      <div className="text-sm text-gray-600">Fleet-цена</div>
                    </div>
                  </div>
                </div>
              )}

              <OTDPreview 
                msrp={lot.msrp - lot.discount}
                state={lot.state}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would continue here... */}
        <TabsContent value="weekly-drop">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Дроп недели
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="weekly-drop"
                  checked={lot.isWeeklyDrop}
                  onCheckedChange={(checked) => handleInputChange('isWeeklyDrop', checked)}
                />
                <Label htmlFor="weekly-drop">Включить дроп недели</Label>
              </div>
              
              {lot.isWeeklyDrop && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Лот будет отмечен как "Дроп недели" и получит специальное оформление
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Continue with other tabs... */}
        <TabsContent value="fomo">
          <div className="text-center py-8 text-gray-500">
            FOMO настройки - в разработке
          </div>
        </TabsContent>

        <TabsContent value="seo">
          <div className="text-center py-8 text-gray-500">
            SEO настройки - в разработке
          </div>
        </TabsContent>

        <TabsContent value="technical">
          <div className="text-center py-8 text-gray-500">
            Технические настройки - в разработке
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LotForm;