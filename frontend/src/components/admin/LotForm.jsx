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
  const { hasPermission, getApiClient } = useAuth();
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
    dealer_addons: 0,
    feesHint: 0,
    state: 'CA',
    competitorPrices: {
      autobandit: { monthly: 0, dueAtSigning: 0, term: 36, updatedAt: '' },
      dealerAverage: { monthly: 0, dueAtSigning: 0, term: 36 }
    },
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
    lease: {
      monthly: 0,
      dueAtSigning: 3000,
      termMonths: 36,
      milesPerYear: 7500
    },
    finance: {
      apr: 9.75,
      termMonths: 60,
      downPayment: 3000
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
      const api = getApiClient();
      const response = await api.get(`/api/admin/lots/${id}`);
      
      // Map snake_case from backend to camelCase for frontend
      const lotData = response.data;
      const mappedLot = {
        id: lotData.id,
        make: lotData.make || '',
        model: lotData.model || '',
        year: lotData.year || new Date().getFullYear(),
        trim: lotData.trim || '',
        vin: lotData.vin || '',
        drivetrain: lotData.drivetrain || 'FWD',
        engine: lotData.engine || '',
        transmission: lotData.transmission || 'AT',
        exteriorColor: lotData.exterior_color || '',
        interiorColor: lotData.interior_color || '',
        msrp: lotData.msrp || '',
        discount: lotData.discount || 0,
        dealer_addons: lotData.dealer_addons || 0,
        feesHint: lotData.fees_hint || 0,
        state: lotData.state || 'CA',
        competitorPrices: lotData.competitor_prices || {
          autobandit: { monthly: 0, dueAtSigning: 0, term: 36, updatedAt: '' },
          dealerAverage: { monthly: 0, dueAtSigning: 0, term: 36 }
        },
        description: lotData.description || '',
        tags: lotData.tags || [],
        isWeeklyDrop: lotData.is_weekly_drop || false,
        dropWindow: lotData.drop_window || null,
        fomo: lotData.fomo || {
          mode: 'inherit',
          viewers: 25,
          confirms15: 5
        },
        seo: lotData.seo || {
          title: '',
          description: '',
          noindex: false
        },
        lease: lotData.lease || {
          monthly: 0,
          dueAtSigning: 3000,
          termMonths: 36,
          milesPerYear: 7500
        },
        finance: lotData.finance || {
          apr: 9.75,
          termMonths: 60,
          downPayment: 3000
        },
        images: lotData.images || [],
        status: lotData.status || 'draft',
        publishAt: lotData.publish_at || null,
        slug: lotData.slug || ''
      };
      
      setLot(mappedLot);
      console.log('Fetched and mapped lot data:', mappedLot);
    } catch (error) {
      console.error('Failed to fetch lot:', error);
      setErrors({ general: t('admin.messages.connection_error') });
    } finally {
      setLoading(false);
    }
  };

  const validateLot = () => {
    const newErrors = {};

    if (!lot.make) newErrors.make = t('admin.validation.make_required');
    if (!lot.model) newErrors.model = t('admin.validation.model_required');
    if (lot.year < 2015 || lot.year > new Date().getFullYear() + 1) {
      newErrors.year = t('admin.validation.year_range') + (new Date().getFullYear() + 1);
    }
    if (!lot.trim) newErrors.trim = t('admin.validation.trim_required');
    if (lot.msrp < 1000) newErrors.msrp = t('admin.validation.msrp_minimum');
    if (lot.discount < 0) newErrors.discount = t('admin.validation.discount_negative');
    if (lot.discount > lot.msrp) newErrors.discount = t('admin.validation.discount_exceeds');
    if (lot.description.length < 140) newErrors.description = t('admin.validation.description_minimum');
    if (lot.images.length === 0) newErrors.images = t('admin.validation.images_required');
    if (lot.vin && lot.vin.length !== 17) newErrors.vin = t('admin.validation.vin_length');

    // FOMO validation
    if (lot.fomo.mode === 'static') {
      if (lot.fomo.viewers < 3) newErrors.fomoViewers = t('admin.validation.fomo_viewers_minimum');
      if (lot.fomo.confirms15 < 3) newErrors.fomoConfirms = t('admin.validation.fomo_confirms_minimum');
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

    // Additional validation for publishing
    if (action === 'publish' || action === 'publish-now') {
      if (!lot.lease || !lot.lease.monthly || lot.lease.monthly <= 0) {
        alert('Lease monthly payment is required and must be greater than $0 before publishing. Please fill in Pricing/OTD tab.');
        setActiveTab('pricing');
        return;
      }
      if (!lot.dealer_addons || lot.dealer_addons <= 0) {
        alert('Dealer add-ons amount is required before publishing. Please fill in Pricing/OTD tab.');
        setActiveTab('pricing');
        return;
      }
    }

    setSaving(true);
    try {
      const api = getApiClient();
      
      const payload = { ...lot };
      if (action === 'publish') payload.status = 'published';
      if (action === 'publish-now') {
        payload.status = 'published';
        payload.publishAt = new Date().toISOString();
      }
      if (action === 'schedule' && lot.publishAt) payload.status = 'scheduled';

      console.log('Saving lot:', payload);

      const response = isEditing
        ? await api.patch(`/api/admin/lots/${id}`, payload)
        : await api.post(`/api/admin/lots`, payload);

      console.log('Lot saved successfully:', response.data);
      
      if (action === 'publish') {
        alert(t('admin.messages.publish_success'));
      } else if (action === 'schedule') {
        alert(t('admin.messages.schedule_success'));
      } else {
        alert(t('admin.messages.save_success'));
      }
      
      setTimeout(() => {
        navigate('/admin/lots');
      }, 1000);
    } catch (error) {
      console.error('Save failed:', error);
      alert(t('admin.messages.save_error') + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = () => {
    const duplicatedLot = {
      ...lot,
      id: undefined, // Remove ID to create new lot
      slug: `${lot.slug}-copy-${Date.now()}`, // Add suffix to slug
      model: lot.model + ' Copy',
      status: 'draft',
      createdAt: null,
      updatedAt: null,
      // Keep all images, pricing, competitor prices, FOMO settings
      images: [...(lot.images || [])],
      competitorPrices: {...(lot.competitorPrices || {})},
      fomo: {...(lot.fomo || {})},
      lease: {...(lot.lease || {})},
      finance: {...(lot.finance || {})}
    };
    setLot(duplicatedLot);
    setIsEditing(false); // Set to creation mode
    // Change URL to creation mode
    window.history.pushState({}, '', '/admin/lots/new');
    alert('Lot duplicated successfully! You can now edit and save as new listing.');
  };

  const handlePreview = async () => {
    try {
      const api = getApiClient();
      
      let response;
      if (isEditing && id) {
        response = await api.post(`/api/admin/lots/${id}/preview`);
      } else {
        response = await api.post(`/api/admin/lots/preview-unsaved`, lot);
      }
      
      const previewUrl = `/preview/${response.data.token}`;
      console.log('Opening preview:', previewUrl);
      window.open(previewUrl, '_blank');
    } catch (error) {
      console.error('Preview error:', error);
      alert(t('admin.messages.preview_error'));
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
            {isEditing ? t('admin.lot_form.title_edit') : t('admin.lot_form.title_create')}
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
              {saving ? t('admin.actions.saving') : t('admin.actions.save')}
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
                
                <Button
                  onClick={() => handleSave('publish-now')}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('admin.actions.publish_now')}
                </Button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing && hasPermission('editor') && (
              <>
                <Button 
                  variant="outline"
                  onClick={handleDuplicate}
                  disabled={saving}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('admin.actions.duplicate')}
                </Button>
                
                <Button variant="outline">
                  <Archive className="w-4 h-4 mr-2" />
                  {t('admin.actions.archive')}
                </Button>
              </>
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
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="basic">{t('admin.lot_form.tabs.basic')}</TabsTrigger>
          <TabsTrigger value="media">{t('admin.lot_form.tabs.media')}</TabsTrigger>
          <TabsTrigger value="pricing">{t('admin.lot_form.tabs.pricing')}</TabsTrigger>
          <TabsTrigger value="comparison">💰 Comparison</TabsTrigger>
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
                {t('admin.lot_form.basic_info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="make">{t('admin.lot_form.make')} *</Label>
                  <Input
                    id="make"
                    value={lot.make}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                    className={errors.make ? 'border-red-500' : ''}
                  />
                  {errors.make && <p className="text-sm text-red-600 mt-1">{errors.make}</p>}
                </div>

                <div>
                  <Label htmlFor="model">{t('admin.lot_form.model')} *</Label>
                  <Input
                    id="model"
                    value={lot.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className={errors.model ? 'border-red-500' : ''}
                  />
                  {errors.model && <p className="text-sm text-red-600 mt-1">{errors.model}</p>}
                </div>

                <div>
                  <Label htmlFor="year">{t('admin.lot_form.year')} *</Label>
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
                  <Label htmlFor="trim">{t('admin.lot_form.trim')} *</Label>
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
                  <Label htmlFor="vin">{t('admin.lot_form.vin')}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="vin"
                      value={lot.vin}
                      onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                      maxLength={17}
                      className={errors.vin ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        if (!lot.vin || lot.vin.length !== 17) {
                          alert('Please enter a 17-character VIN first');
                          return;
                        }
                        try {
                          const api = getApiClient();
                          const response = await api.get(`/api/admin/vin/decode/${lot.vin}`);
                          const decoded = response.data.decoded;
                          
                          // Auto-fill fields from VIN decode
                          if (decoded.make) handleInputChange('make', decoded.make);
                          if (decoded.model) handleInputChange('model', decoded.model);
                          if (decoded.year) handleInputChange('year', parseInt(decoded.year));
                          if (decoded.trim) handleInputChange('trim', decoded.trim);
                          if (decoded.drivetrain) {
                            const driveMap = {
                              'AWD': 'AWD',
                              '4WD': 'AWD', 
                              'FWD': 'FWD',
                              'RWD': 'RWD'
                            };
                            const drive = driveMap[decoded.drivetrain.toUpperCase()] || 'FWD';
                            handleInputChange('drivetrain', drive);
                          }
                          
                          alert('VIN decoded successfully! Fields auto-populated.');
                        } catch (error) {
                          console.error('VIN decode error:', error);
                          alert('Failed to decode VIN: ' + (error.response?.data?.detail || error.message));
                        }
                      }}
                      disabled={!lot.vin || lot.vin.length !== 17}
                    >
                      Decode VIN
                    </Button>
                  </div>
                  {errors.vin && <p className="text-sm text-red-600 mt-1">{errors.vin}</p>}
                  <p className="text-xs text-gray-500 mt-1">17 characters. Click "Decode VIN" to auto-populate fields.</p>
                </div>

                <div>
                  <Label htmlFor="drivetrain">{t('admin.lot_form.drivetrain')}</Label>
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
                  <Label htmlFor="transmission">{t('admin.lot_form.transmission')}</Label>
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
                  <Label htmlFor="engine">{t('admin.lot_form.engine')}</Label>
                  <Input
                    id="engine"
                    value={lot.engine}
                    onChange={(e) => handleInputChange('engine', e.target.value)}
                    placeholder="1.5L Turbo I4"
                  />
                </div>

                <div>
                  <Label htmlFor="exteriorColor">{t('admin.lot_form.exterior_color')}</Label>
                  <Input
                    id="exteriorColor"
                    value={lot.exteriorColor}
                    onChange={(e) => handleInputChange('exteriorColor', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="interiorColor">{t('admin.lot_form.interior_color')}</Label>
                  <Input
                    id="interiorColor"
                    value={lot.interiorColor}
                    onChange={(e) => handleInputChange('interiorColor', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">{t('admin.lot_form.description')} *</Label>
                <Textarea
                  id="description"
                  value={lot.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{lot.description.length}/140 {t('admin.lot_form.min_chars')}</span>
                  {errors.description && <span className="text-red-600">{errors.description}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tags">{t('admin.lot_form.tags')}</Label>
                  <Input
                    id="tags"
                    value={lot.tags.join(', ')}
                    onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                    placeholder="sedan, 2024, honda"
                  />
                </div>

                <div>
                  <Label htmlFor="state">{t('admin.lot_form.state')}</Label>
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
                  {t('admin.lot_form.generate_slug')}
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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  {t('admin.lot_form.media_files')}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!lot.id && !isEditing) {
                        alert('Please save the lot first before fetching AutoBandit images');
                        return;
                      }
                      if (!lot.make || !lot.model || !lot.year) {
                        alert('Please fill in Make, Model, and Year fields first');
                        return;
                      }
                      try {
                        const api = getApiClient();
                        const response = await api.post(`/api/admin/lots/${id}/fetch-autobandit-images`);
                        
                        if (response.data.ok) {
                          // Reload lot to get new images
                          await fetchLot();
                          alert(response.data.message);
                        } else {
                          alert(response.data.message + '\n' + (response.data.suggestion || ''));
                        }
                      } catch (error) {
                        console.error('AutoBandit fetch error:', error);
                        alert('Failed to fetch from AutoBandit. Try Auto-Find Images instead.');
                      }
                    }}
                    disabled={!isEditing || !lot.make || !lot.model || !lot.year}
                  >
                    🤖 AutoBandit Images
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!lot.make || !lot.model || !lot.year) {
                        alert('Please fill in Make, Model, and Year fields first');
                        return;
                      }
                      try {
                        const api = getApiClient();
                        const params = {
                          make: lot.make,
                          model: lot.model,
                          year: lot.year,
                          trim: lot.trim || undefined
                        };
                        const response = await api.get('/api/admin/search-car-images', { params });
                        const imageData = response.data;
                        
                        if (imageData.images && imageData.images.length > 0) {
                          // Map found images to lot format
                          const newImages = imageData.images.map(img => ({
                            url: img.url,
                            alt: img.alt || `${lot.year} ${lot.make} ${lot.model}`
                          }));
                          
                          // Add to existing images
                          handleInputChange('images', [...lot.images, ...newImages]);
                          alert(`Found ${newImages.length} images! ${imageData.note || ''}`);
                        } else {
                          alert('No images found for this vehicle');
                        }
                      } catch (error) {
                        console.error('Image search error:', error);
                        alert('Failed to search images: ' + (error.response?.data?.detail || error.message));
                      }
                    }}
                    disabled={!lot.make || !lot.model || !lot.year}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Auto-Find Images
                  </Button>
                </div>
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                🤖 AutoBandit: scrape similar vehicles | 🔍 Auto-Find: professional stock photos
              </p>
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
                {t('admin.lot_form.pricing_info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="msrp">{t('admin.lot_form.msrp')} *</Label>
                  <Input
                    id="msrp"
                    type="number"
                    min="1000"
                    step="100"
                    placeholder={t('admin.lot_form.msrp')}
                    value={lot.msrp || ''}
                    onChange={(e) => handleInputChange('msrp', parseInt(e.target.value) || 0)}
                    className={errors.msrp ? 'border-red-500' : ''}
                  />
                  {errors.msrp && <p className="text-sm text-red-600 mt-1">{errors.msrp}</p>}
                </div>

                <div>
                  <Label htmlFor="discount">{t('admin.lot_form.discount')}</Label>
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
                  <Label htmlFor="dealer_addons">Typical Dealer Add-ons ($) *</Label>
                  <Input
                    id="dealer_addons"
                    type="number"
                    min="0"
                    placeholder="e.g., 5000"
                    value={lot.dealer_addons || ''}
                    onChange={(e) => handleInputChange('dealer_addons', parseInt(e.target.value) || 0)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    What LA dealers typically charge in add-ons for this model
                  </p>
                </div>

                <div>
                  <Label htmlFor="feesHint">{t('admin.lot_form.known_fees')}</Label>
                  <Input
                    id="feesHint"
                    type="number"
                    min="0"
                    value={lot.feesHint}
                    onChange={(e) => handleInputChange('feesHint', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('admin.lot_form.known_fees_hint')}
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
                      <div className="text-sm text-gray-600">{t('admin.lot_form.msrp')}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatPrice(Math.abs(lot.discount))}
                      </div>
                      <div className="text-sm text-gray-600">{t('admin.lot_form.discount')}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(lot.msrp - lot.discount)}
                      </div>
                      <div className="text-sm text-gray-600">{t('admin.lot_form.fleet_price')}</div>
                    </div>
                  </div>
                </div>
              )}

              <OTDPreview 
                msrp={lot.msrp - lot.discount}
                state={lot.state}
              />
              
              {/* Lease and Finance Calculator */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Payment Calculator</CardTitle>
                  <CardDescription>Configure lease and finance options</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="lease" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="lease">Lease</TabsTrigger>
                      <TabsTrigger value="finance">Finance</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="lease" className="space-y-4 mt-4">
                      <div className="bg-blue-50 p-3 rounded text-sm text-blue-900">
                        💡 Lease uses <strong>Money Factor</strong> (Interest Rate ÷ 2400)
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="lease_monthly">Monthly Payment ($) *</Label>
                          <Input
                            id="lease_monthly"
                            type="number"
                            min="0"
                            placeholder="e.g., 499"
                            value={lot.lease?.monthly || ''}
                            onChange={(e) => {
                              const newLease = {...(lot.lease || {}), monthly: parseInt(e.target.value) || 0};
                              handleInputChange('lease', newLease);
                            }}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="lease_due">Due at Signing ($)</Label>
                          <Input
                            id="lease_due"
                            type="number"
                            min="0"
                            value={lot.lease?.dueAtSigning || 3000}
                            onChange={(e) => {
                              const newLease = {...(lot.lease || {}), dueAtSigning: parseInt(e.target.value) || 0};
                              handleInputChange('lease', newLease);
                            }}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="lease_term">Term (months)</Label>
                          <Input
                            id="lease_term"
                            type="number"
                            value={lot.lease?.termMonths || 36}
                            onChange={(e) => {
                              const newLease = {...(lot.lease || {}), termMonths: parseInt(e.target.value) || 36};
                              handleInputChange('lease', newLease);
                            }}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="lease_miles">Miles/Year</Label>
                          <Input
                            id="lease_miles"
                            type="number"
                            value={lot.lease?.milesPerYear || 7500}
                            onChange={(e) => {
                              const newLease = {...(lot.lease || {}), milesPerYear: parseInt(e.target.value) || 7500};
                              handleInputChange('lease', newLease);
                            }}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="finance" className="space-y-4 mt-4">
                      <div className="bg-green-50 p-3 rounded text-sm text-green-900">
                        💡 Finance uses <strong>APR</strong> (Annual Percentage Rate)
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="finance_apr">APR (%)</Label>
                          <Input
                            id="finance_apr"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g., 9.75"
                            value={lot.finance?.apr || ''}
                            onChange={(e) => {
                              const newFinance = {...(lot.finance || {}), apr: parseFloat(e.target.value) || 0};
                              handleInputChange('finance', newFinance);
                            }}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="finance_term">Term (months)</Label>
                          <Input
                            id="finance_term"
                            type="number"
                            value={lot.finance?.termMonths || 60}
                            onChange={(e) => {
                              const newFinance = {...(lot.finance || {}), termMonths: parseInt(e.target.value) || 60};
                              handleInputChange('finance', newFinance);
                            }}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="finance_down">Down Payment ($)</Label>
                          <Input
                            id="finance_down"
                            type="number"
                            min="0"
                            value={lot.finance?.downPayment || 3000}
                            onChange={(e) => {
                              const newFinance = {...(lot.finance || {}), downPayment: parseInt(e.target.value) || 0};
                              handleInputChange('finance', newFinance);
                            }}
                          />
                        </div>
                        
                        <div className="flex items-end">
                          <div className="text-sm text-gray-600">
                            Money Factor = APR ÷ 2400<br/>
                            {lot.finance?.apr ? `= ${(lot.finance.apr / 2400).toFixed(5)}` : ''}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would continue here... */}

        {/* Price Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Competitor Price Comparison
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Add competitor prices (AutoBandit, dealers) to show your competitive advantage on the car detail page
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AutoBandit Pricing */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <img src="https://autobandit.com/_next/static/media/autobandit_logo_white.862b4ec7.svg" alt="AutoBandit" className="h-6 invert" />
                  AutoBandit Price
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="autobandit_monthly">Monthly Payment</Label>
                    <Input
                      id="autobandit_monthly"
                      type="number"
                      min="0"
                      placeholder="e.g. 850"
                      value={lot.competitorPrices.autobandit.monthly || ''}
                      onChange={(e) => {
                        const newPrices = {...lot.competitorPrices};
                        newPrices.autobandit.monthly = parseInt(e.target.value) || 0;
                        newPrices.autobandit.updatedAt = new Date().toISOString();
                        handleInputChange('competitorPrices', newPrices);
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">$/month</p>
                  </div>
                  <div>
                    <Label htmlFor="autobandit_due">Due at Signing</Label>
                    <Input
                      id="autobandit_due"
                      type="number"
                      min="0"
                      placeholder="e.g. 3500"
                      value={lot.competitorPrices.autobandit.dueAtSigning || ''}
                      onChange={(e) => {
                        const newPrices = {...lot.competitorPrices};
                        newPrices.autobandit.dueAtSigning = parseInt(e.target.value) || 0;
                        newPrices.autobandit.updatedAt = new Date().toISOString();
                        handleInputChange('competitorPrices', newPrices);
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Total upfront</p>
                  </div>
                  <div>
                    <Label htmlFor="autobandit_term">Term (months)</Label>
                    <Select
                      value={lot.competitorPrices.autobandit.term?.toString() || '36'}
                      onValueChange={(value) => {
                        const newPrices = {...lot.competitorPrices};
                        newPrices.autobandit.term = parseInt(value);
                        handleInputChange('competitorPrices', newPrices);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                        <SelectItem value="48">48 months</SelectItem>
                        <SelectItem value="60">60 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {lot.competitorPrices.autobandit.updatedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Last updated: {new Date(lot.competitorPrices.autobandit.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Dealer Average Pricing */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-lg mb-4">
                  Dealer Average Price (California)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dealer_monthly">Monthly Payment</Label>
                    <Input
                      id="dealer_monthly"
                      type="number"
                      min="0"
                      placeholder="e.g. 900"
                      value={lot.competitorPrices.dealerAverage.monthly || ''}
                      onChange={(e) => {
                        const newPrices = {...lot.competitorPrices};
                        newPrices.dealerAverage.monthly = parseInt(e.target.value) || 0;
                        handleInputChange('competitorPrices', newPrices);
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">$/month</p>
                  </div>
                  <div>
                    <Label htmlFor="dealer_due">Due at Signing</Label>
                    <Input
                      id="dealer_due"
                      type="number"
                      min="0"
                      placeholder="e.g. 4000"
                      value={lot.competitorPrices.dealerAverage.dueAtSigning || ''}
                      onChange={(e) => {
                        const newPrices = {...lot.competitorPrices};
                        newPrices.dealerAverage.dueAtSigning = parseInt(e.target.value) || 0;
                        handleInputChange('competitorPrices', newPrices);
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Total upfront</p>
                  </div>
                  <div>
                    <Label htmlFor="dealer_term">Term (months)</Label>
                    <Select
                      value={lot.competitorPrices.dealerAverage.term?.toString() || '36'}
                      onValueChange={(value) => {
                        const newPrices = {...lot.competitorPrices};
                        newPrices.dealerAverage.term = parseInt(value);
                        handleInputChange('competitorPrices', newPrices);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                        <SelectItem value="48">48 months</SelectItem>
                        <SelectItem value="60">60 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Preview Savings */}
              {(lot.competitorPrices.autobandit.monthly > 0 || lot.competitorPrices.dealerAverage.monthly > 0) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-green-900 mb-2">💰 Savings Preview</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Based on your fleet price (MSRP - Discount), here's how you compare:
                  </p>
                  {lot.msrp > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Your Fleet Price:</span>
                        <span className="text-xl font-bold text-green-600">
                          {formatPrice(lot.msrp - lot.discount)}
                        </span>
                      </div>
                      {lot.competitorPrices.autobandit.monthly > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span>vs AutoBandit (${lot.competitorPrices.autobandit.monthly}/mo):</span>
                          <span className="font-semibold text-green-700">
                            Save ${Math.abs((lot.competitorPrices.autobandit.monthly - ((lot.msrp - lot.discount) / lot.competitorPrices.autobandit.term))).toFixed(0)}/mo
                          </span>
                        </div>
                      )}
                      {lot.competitorPrices.dealerAverage.monthly > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span>vs Dealer Avg (${lot.competitorPrices.dealerAverage.monthly}/mo):</span>
                          <span className="font-semibold text-green-700">
                            Save ${Math.abs((lot.competitorPrices.dealerAverage.monthly - ((lot.msrp - lot.discount) / lot.competitorPrices.dealerAverage.term))).toFixed(0)}/mo
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-600 mt-3">
                    💡 These savings will be displayed prominently on the car detail page to show your competitive advantage
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">📝 How to find AutoBandit prices:</h4>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://autobandit.com/deals" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">autobandit.com/deals</a></li>
                  <li>Search for the same Make, Model, Year, Trim</li>
                  <li>Copy the "Lease Payment" and "Due at signing" values</li>
                  <li>Paste them here to show your competitive pricing</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly-drop">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {t('admin.lot_form.tabs.weekly_drop')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="weekly-drop"
                  checked={lot.isWeeklyDrop}
                  onCheckedChange={(checked) => handleInputChange('isWeeklyDrop', checked)}
                />
                <Label htmlFor="weekly-drop">{t('admin.lot_form.weekly_drop_enable')}</Label>
              </div>
              
              {lot.isWeeklyDrop && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    {t('admin.lot_form.weekly_drop_notice')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Continue with other tabs... */}
        <TabsContent value="fomo">
          <div className="text-center py-8 text-gray-500">
            {t('admin.lot_form.fomo_settings')}
          </div>
        </TabsContent>

        <TabsContent value="seo">
          <div className="text-center py-8 text-gray-500">
            {t('admin.lot_form.seo_settings')}
          </div>
        </TabsContent>

        <TabsContent value="technical">
          <div className="text-center py-8 text-gray-500">
            {t('admin.lot_form.technical_settings')}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LotForm;