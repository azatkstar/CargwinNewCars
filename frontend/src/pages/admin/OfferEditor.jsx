import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

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
    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      const url = id 
        ? `${BACKEND_URL}/api/admin/offers/${id}`
        : `${BACKEND_URL}/api/admin/offers`;
      
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(offer)
      });

      if (response.ok) {
        alert('Offer saved!');
        navigate('/admin/offers');
      } else {
        alert('Error saving offer');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving offer');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (path, value) => {
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
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Offer'}
          </Button>
        </div>
      </div>

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
                onChange={(e) => updateField('msrp', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label>Discount</Label>
              <Input
                type="number"
                value={offer.discount}
                onChange={(e) => updateField('discount', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <Label>Selling Price</Label>
              <Input
                type="number"
                value={offer.msrp && offer.discount ? offer.msrp - offer.discount : (offer.sellingPrice || 0)}
                onChange={(e) => updateField('sellingPrice', parseFloat(e.target.value))}
                placeholder="Auto-calculated from MSRP - Discount"
              />
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
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Image URL</Label>
            <Input
              value={offer.image}
              onChange={(e) => updateField('image', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={offer.status}
            onValueChange={(v) => updateField('status', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active (Published)</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Vehicle Specs */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Body Style</Label>
              <Input
                value={offer.specs?.bodyStyle || ''}
                onChange={(e) => updateField('specs.bodyStyle', e.target.value)}
                placeholder="Sedan, SUV, Truck"
              />
            </div>
            <div>
              <Label>Transmission</Label>
              <Input
                value={offer.specs?.transmission || ''}
                onChange={(e) => updateField('specs.transmission', e.target.value)}
              />
            </div>
            <div>
              <Label>Drivetrain</Label>
              <Input
                value={offer.specs?.drivetrain || ''}
                onChange={(e) => updateField('specs.drivetrain', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Exterior Color</Label>
              <Input
                value={offer.specs?.exteriorColor || ''}
                onChange={(e) => updateField('specs.exteriorColor', e.target.value)}
              />
            </div>
            <div>
              <Label>Interior Color</Label>
              <Input
                value={offer.specs?.interiorColor || ''}
                onChange={(e) => updateField('specs.interiorColor', e.target.value)}
              />
            </div>
            <div>
              <Label>Fuel Type</Label>
              <Input
                value={offer.specs?.fuelType || ''}
                onChange={(e) => updateField('specs.fuelType', e.target.value)}
                placeholder="Gas, Hybrid, Electric"
              />
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
