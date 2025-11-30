import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function CreateDeal() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState({
    brand: 'Toyota',
    model: '',
    trim: '',
    year: 2025,
    msrp: 35000,
    selling_price: 33000,
    term_months: 36,
    annual_mileage: 10000,
    region: 'California',
    image_url: '',
    description: '',
    stock_count: 1
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/lease/brands-models`)
      .then(res => res.json())
      .then(data => setBrands(data.brands || []))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/deals/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create deal');
      }

      setSuccess(true);
      setTimeout(() => navigate('/admin/featured-deals'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const discount = formData.msrp - formData.selling_price;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Create Featured Deal</h1>
        <p className="text-gray-600">New deal will be auto-calculated using PRO calculator</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Vehicle Info */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Brand</Label>
                  <Select value={formData.brand} onValueChange={(v) => updateField('brand', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(b => (
                        <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Model</Label>
                  <Input
                    value={formData.model}
                    onChange={(e) => updateField('model', e.target.value)}
                    placeholder="Camry"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Trim</Label>
                  <Input
                    value={formData.trim}
                    onChange={(e) => updateField('trim', e.target.value)}
                    placeholder="LE, XLE, etc."
                  />
                </div>

                <div>
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => updateField('year', parseInt(e.target.value))}
                    required
                  />
                </div>
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
                    value={formData.msrp}
                    onChange={(e) => updateField('msrp', parseFloat(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <Label>Selling Price</Label>
                  <Input
                    type="number"
                    value={formData.selling_price}
                    onChange={(e) => updateField('selling_price', parseFloat(e.target.value))}
                    required
                  />
                  <p className="text-sm text-green-600 mt-1">
                    Discount: ${discount.toLocaleString()}
                  </p>
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Term (months)</Label>
                  <Select value={formData.term_months.toString()} onValueChange={(v) => updateField('term_months', parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24</SelectItem>
                      <SelectItem value="36">36</SelectItem>
                      <SelectItem value="39">39</SelectItem>
                      <SelectItem value="42">42</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Annual Mileage</Label>
                  <Select value={formData.annual_mileage.toString()} onValueChange={(v) => updateField('annual_mileage', parseInt(v))}>
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

                <div>
                  <Label>Stock Count</Label>
                  <Input
                    type="number"
                    value={formData.stock_count}
                    onChange={(e) => updateField('stock_count', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label>Region</Label>
                <Input
                  value={formData.region}
                  onChange={(e) => updateField('region', e.target.value)}
                  placeholder="California"
                />
              </div>
            </CardContent>
          </Card>

          {/* Media & Description */}
          <Card>
            <CardHeader>
              <CardTitle>Media & Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Image URL</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => updateField('image_url', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  className="w-full border rounded-md p-3 min-h-24"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Brief description of this deal..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={creating} className="flex-1">
              {creating ? 'Creating & Calculating...' : 'Create Deal'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/featured-deals')}
            >
              Cancel
            </Button>
          </div>

          {/* Success */}
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription>
                Deal created successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          {/* Error */}
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription>
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </form>
    </div>
  );
}
