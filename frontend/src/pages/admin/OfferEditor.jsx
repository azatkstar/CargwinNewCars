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
      region: 'California'
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
  const [saving, setSaving] = useState(false);

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
          <div className="grid grid-cols-2 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Lease Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Lease Terms</CardTitle>
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
              <Label>Due at Signing</Label>
              <Input
                type="number"
                value={offer.lease?.dueAtSigning || 0}
                onChange={(e) => updateField('lease.dueAtSigning', parseFloat(e.target.value))}
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
