import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import ImageManager from '../../components/ImageManager';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function OfferEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState({
    title: '',
    make: '',
    model: '',
    year: 2025,
    trim: '',
    vin: '',
    msrp: 0,
    discount: 0,
    sellingPrice: 0,
    description: '',
    image: '',
    images: [],
    status: 'active',
    source: 'manual',
    lease: {
      monthly: 0,
      dueAtSigning: 0,
      termMonths: 36,
      milesPerYear: 10000,
      moneyFactor: 0.00150,
      residual: 60,
      acquisitionFee: 695,
      taxRate: 0.0925,
      region: 'California',
      bank: ''
    },
    specs: {
      make: '',
      model: '',
      year: 2025,
      transmission: '',
      drivetrain: '',
      exteriorColor: '',
      interiorColor: '',
      bodyStyle: '',
      fuelType: ''
    },
    seo: {
      title: '',
      metaDescription: '',
      keywords: '',
      slug: '',
      tags: []
    },
    aiSignals: {
      priority: 1,
      verified: true
    }
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Validation functions
  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'year':
        const currentYear = new Date().getFullYear();
        if (!value || value < 2000 || value > currentYear + 2) {
          error = `Year must be between 2000 and ${currentYear + 2}`;
        }
        break;
      
      case 'msrp':
        if (!value || value <= 0) {
          error = 'MSRP is required and must be > 0';
        }
        break;
      
      case 'discount':
        if (value === '' || value === null || value === undefined) {
          error = 'Discount is required (can be 0)';
        }
        if (value < 0) {
          error = 'Discount cannot be negative';
        }
        break;
      
      case 'sellingPrice':
        if (!value || value <= 0) {
          error = 'Selling Price must be > 0';
        }
        break;
      
      case 'make':
        if (!value || value.trim().length < 2) {
          error = 'Make is required (min 2 characters)';
        }
        break;
      
      case 'model':
        if (!value || value.trim().length < 1) {
          error = 'Model is required';
        }
        break;
      
      case 'monthly':
        if (!value || value <= 0) {
          error = 'Monthly Payment is required and must be > 0';
        }
        break;
      
      case 'moneyFactor':
        if (!value || value <= 0 || value > 1) {
          error = 'Money Factor must be between 0 and 1';
        }
        break;
      
      case 'residual':
        if (!value || value <= 0 || value > 100) {
          error = 'Residual % must be between 0 and 100';
        }
        break;
      
      case 'taxRate':
        if (value === '' || value < 0 || value > 1) {
          error = 'Tax Rate must be between 0 and 1 (e.g., 0.0925)';
        }
        break;
      
      case 'slug':
        if (value && !/^[a-z0-9-]+$/.test(value)) {
          error = 'Slug can only contain lowercase letters, numbers, and hyphens';
        }
        break;
      
      case 'images':
        if (!value || value.length === 0) {
          error = 'At least 1 image is required';
        }
        break;
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return error === '';
  };

  const validateAllFields = () => {
    const fieldsToValidate = [
      ['year', offer.year],
      ['msrp', offer.msrp],
      ['discount', offer.discount],
      ['sellingPrice', offer.sellingPrice || (offer.msrp - offer.discount)],
      ['make', offer.make],
      ['model', offer.model],
      ['monthly', offer.lease?.monthly],
      ['moneyFactor', offer.lease?.moneyFactor],
      ['residual', offer.lease?.residual],
      ['taxRate', offer.lease?.taxRate]
    ];

    let hasErrors = false;
    const newErrors = {};

    fieldsToValidate.forEach(([field, value]) => {
      const isValid = validateField(field, value);
      if (!isValid) {
        hasErrors = true;
      }
    });

    return !hasErrors;
  };

  const hasAnyErrors = () => {
    return Object.values(errors).some(err => err !== '');
  };

  useEffect(() => {
    if (id) {
      loadOffer();
    }
  }, [id]);

  const loadOffer = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/admin/offers/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setOffer(data);
      }
    } catch (err) {
      console.error('Error loading offer:', err);
    }
  };

  const handleSave = async () => {
    // Validate all fields
    if (!validateAllFields()) {
      alert('Пожалуйста, исправьте ошибки в форме');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      const url = id 
        ? `${BACKEND_URL}/api/admin/offers/${id}`
        : `${BACKEND_URL}/api/admin/offers`;
      
      const method = id ? 'PUT' : 'POST';

      console.log('Saving offer:', offer);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(offer)
      });

      const data = await response.json();
      
      console.log('Response:', data);

      if (data.success || response.ok) {
        if (data.warning) {
          alert(`Offer saved with warning: ${data.warning}`);
        } else {
          alert('Offer saved successfully!');
        }
        navigate('/admin/offers');
      } else {
        // Show detailed error
        const errorMsg = data.error || data.detail || 'Unknown error';
        alert(`Error saving offer:\n${errorMsg}`);
        
        // Log to console for debugging
        console.error('Save failed:', data);
      }
    } catch (err) {
      console.error('Save error:', err);
      alert(`Error saving offer:\n${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (path, value) => {
    // Handle comma → dot conversion for numbers
    if (typeof value === 'string' && /^\d+,\d+$/.test(value)) {
      value = value.replace(',', '.');
    }

    // Auto-trim for text fields
    if (typeof value === 'string' && ['make', 'model', 'slug'].some(f => path.includes(f))) {
      value = value.trim();
    }

    // Auto-format slug
    if (path.includes('slug')) {
      value = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    const keys = path.split('.');
    setOffer(prev => {
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });

    // Validate on change
    const fieldName = keys[keys.length - 1];
    setTimeout(() => validateField(fieldName, value), 100);
  };

  const FieldError = ({ fieldName }) => {
    if (!errors[fieldName]) return null;
    
    return (
      <div className="error-text text-xs text-red-600 mt-1">
        {errors[fieldName]}
      </div>
    );
  };

  const ErrorSummary = () => {
    const errorEntries = Object.entries(errors).filter(([_, msg]) => msg);
    
    if (errorEntries.length === 0) return null;

    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-red-800 mb-2">Исправьте ошибки:</h4>
        <ul className="list-disc list-inside space-y-1">
          {errorEntries.map(([field, msg]) => (
            <li key={field} className="text-sm text-red-700">
              <strong>{field}:</strong> {msg}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {id ? 'Edit Offer' : 'Create Offer'}
          </h1>
          <p className="text-gray-600">Edit all offer fields</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/admin/offers')} variant="outline">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || hasAnyErrors()}
            className={hasAnyErrors() ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {saving ? 'Saving...' : 'Save Offer'}
          </Button>
        </div>
      </div>

      {/* Error Summary */}
      <ErrorSummary />

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Title</Label>
              <Input
                value={offer.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="2025 Toyota Camry LE"
              />
            </div>
            <div>
              <Label>Source</Label>
              <Input
                value={offer.source}
                onChange={(e) => updateField('source', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Make</Label>
              <Input
                value={offer.make}
                onChange={(e) => updateField('make', e.target.value)}
              />
            </div>
            <div>
              <Label>Model</Label>
              <Input
                value={offer.model}
                onChange={(e) => updateField('model', e.target.value)}
              />
            </div>
            <div>
              <Label>Year</Label>
              <Input
                type="number"
                value={offer.year}
                onChange={(e) => updateField('year', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label>Trim</Label>
            <Input
              value={offer.trim}
              onChange={(e) => updateField('trim', e.target.value)}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={offer.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>MSRP</Label>
              <Input
                type="number"
                value={offer.msrp}
                onChange={(e) => updateField('msrp', parseFloat(e.target.value) || 0)}
                onBlur={(e) => validateField('msrp', parseFloat(e.target.value))}
                className={errors.msrp ? 'border-red-500 bg-red-50' : ''}
              />
              <FieldError fieldName="msrp" />
            </div>
            <div>
              <Label>Discount</Label>
              <Input
                type="number"
                value={offer.discount}
                onChange={(e) => updateField('discount', parseFloat(e.target.value) || 0)}
                onBlur={(e) => validateField('discount', parseFloat(e.target.value))}
                className={errors.discount ? 'border-red-500 bg-red-50' : ''}
              />
              <FieldError fieldName="discount" />
            </div>
            <div>
              <Label>Selling Price</Label>
              <Input
                type="number"
                value={offer.msrp && offer.discount >= 0 ? offer.msrp - offer.discount : (offer.sellingPrice || 0)}
                onChange={(e) => updateField('sellingPrice', parseFloat(e.target.value))}
                onBlur={(e) => validateField('sellingPrice', parseFloat(e.target.value))}
                placeholder="Auto-calculated from MSRP - Discount"
                className={errors.sellingPrice ? 'border-red-500 bg-red-50' : ''}
              />
              <FieldError fieldName="sellingPrice" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lease Terms - Extended */}
      <Card>
        <CardHeader>
          <CardTitle>Lease Calculator Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Monthly Payment</Label>
              <Input
                type="number"
                value={offer.lease?.monthly || 0}
                onChange={(e) => updateField('lease.monthly', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label>Due at Signing (DAS)</Label>
              <Input
                type="number"
                value={offer.lease?.dueAtSigning || 0}
                onChange={(e) => updateField('lease.dueAtSigning', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Money Factor (MF)</Label>
              <Input
                type="number"
                step="0.00001"
                value={offer.lease?.moneyFactor || 0}
                onChange={(e) => updateField('lease.moneyFactor', parseFloat(e.target.value))}
                placeholder="0.00150"
              />
            </div>
            <div>
              <Label>Residual Value (%)</Label>
              <Input
                type="number"
                value={offer.lease?.residual || 0}
                onChange={(e) => updateField('lease.residual', parseFloat(e.target.value))}
                placeholder="60"
              />
            </div>
            <div>
              <Label>Residual Value ($)</Label>
              <Input
                type="number"
                value={offer.msrp && offer.lease?.residual 
                  ? Math.round(offer.msrp * (offer.lease.residual / 100))
                  : 0}
                readOnly
                className="bg-gray-100"
                placeholder="Auto-calculated"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Acquisition Fee</Label>
              <Input
                type="number"
                value={offer.lease?.acquisitionFee || 0}
                onChange={(e) => updateField('lease.acquisitionFee', parseFloat(e.target.value))}
                placeholder="695"
              />
            </div>
            <div>
              <Label>Tax Rate</Label>
              <Input
                type="number"
                step="0.0001"
                value={offer.lease?.taxRate || 0}
                onChange={(e) => updateField('lease.taxRate', parseFloat(e.target.value))}
                placeholder="0.0925"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Region</Label>
              <Input
                value={offer.lease?.region || ''}
                onChange={(e) => updateField('lease.region', e.target.value)}
                placeholder="California"
              />
            </div>
            <div>
              <Label>Bank Program</Label>
              <Input
                value={offer.lease?.bank || ''}
                onChange={(e) => updateField('lease.bank', e.target.value)}
                placeholder="TFS, AHFC, etc"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Term (Months)</Label>
              <Select
                value={offer.lease?.termMonths?.toString() || '36'}
                onValueChange={(v) => updateField('lease.termMonths', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="36">36</SelectItem>
                  <SelectItem value="39">39</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Miles Per Year</Label>
              <Select
                value={offer.lease?.milesPerYear?.toString() || '10000'}
                onValueChange={(v) => updateField('lease.milesPerYear', parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7500">7,500</SelectItem>
                  <SelectItem value="10000">10,000</SelectItem>
                  <SelectItem value="12000">12,000</SelectItem>
                  <SelectItem value="15000">15,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Images (Drag to Reorder)</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageManager
            images={offer.images || []}
            onChange={(newImages) => {
              setOffer(prev => ({ ...prev, images: newImages }));
              if (newImages.length === 0) {
                setErrors(prev => ({ ...prev, images: 'At least 1 image required' }));
              } else {
                setErrors(prev => ({ ...prev, images: '' }));
              }
            }}
          />
          <FieldError fieldName="images" />
        </CardContent>
      </Card>

      {/* Status - Controls Publishing */}
      <Card>
        <CardHeader>
          <CardTitle>Publication Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Select
              value={offer.status}
              onValueChange={(v) => {
                updateField('status', v);
                // Active = published immediately
                updateField('published', v === 'active');
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active (Published)</SelectItem>
                <SelectItem value="draft">Draft (Not Published)</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded">
              ℹ️ Active = Публикуется сразу на /deals<br />
              Draft = Сохраняется но не показывается
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Fields */}
      <Card>
        <CardHeader>
          <CardTitle>SEO & Marketing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>SEO Title</Label>
            <Input
              value={offer.seo?.title || ''}
              onChange={(e) => updateField('seo.title', e.target.value)}
              placeholder="2025 Toyota Camry Lease | Hunter.Lease"
            />
          </div>

          <div>
            <Label>Meta Description</Label>
            <Textarea
              value={offer.seo?.metaDescription || ''}
              onChange={(e) => updateField('seo.metaDescription', e.target.value)}
              rows={2}
              placeholder="Lease description for search engines..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Keywords</Label>
              <Input
                value={offer.seo?.keywords || ''}
                onChange={(e) => updateField('seo.keywords', e.target.value)}
                placeholder="toyota, camry, lease, california"
              />
            </div>
            <div>
              <Label>URL Slug</Label>
              <Input
                value={offer.seo?.slug || ''}
                onChange={(e) => updateField('seo.slug', e.target.value)}
                placeholder="2025-toyota-camry-le"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button onClick={() => navigate('/admin/offers')} variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Offer'}
        </Button>
      </div>
    </div>
  );
}
