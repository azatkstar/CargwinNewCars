import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function LeaseCalculator() {
  // Form state
  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState('');
  const [models, setModels] = useState([]);
  const [model, setModel] = useState('');
  
  const [msrp, setMsrp] = useState(35000);
  const [sellingPrice, setSellingPrice] = useState(33000);
  const [termMonths, setTermMonths] = useState(36);
  const [annualMileage, setAnnualMileage] = useState(10000);
  const [taxRate, setTaxRate] = useState(9.25);
  const [downPayment, setDownPayment] = useState(0);
  const [zeroDriveOff, setZeroDriveOff] = useState(false);
  
  // Result state
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load brands on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/lease/brands-models`)
      .then(res => res.json())
      .then(data => {
        setBrands(data.brands || []);
        if (data.brands?.length > 0) {
          setBrand(data.brands[0].name);
          setModels(data.brands[0].models || []);
          if (data.brands[0].models?.length > 0) {
            setModel(data.brands[0].models[0]);
          }
        }
      })
      .catch(err => console.error('Error loading brands:', err));
  }, []);

  // Update models when brand changes
  useEffect(() => {
    const selectedBrand = brands.find(b => b.name === brand);
    if (selectedBrand) {
      setModels(selectedBrand.models || []);
      if (selectedBrand.models?.length > 0) {
        setModel(selectedBrand.models[0]);
      }
    }
  }, [brand, brands]);

  const calculateLease = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/lease/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          model,
          msrp: parseFloat(msrp),
          selling_price: parseFloat(sellingPrice),
          term_months: parseInt(termMonths),
          annual_mileage: parseInt(annualMileage),
          tax_rate: parseFloat(taxRate) / 100,
          down_payment: parseFloat(downPayment),
          drive_off_mode: zeroDriveOff ? 'zero' : 'standard',
          apply_incentives: true
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Calculation failed');
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const discount = msrp - sellingPrice;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Hunter.Lease PRO Calculator</h1>
          <p className="text-gray-600 text-lg">
            Real lease payments using actual bank programs (MF/RV) — not guesses
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            {/* Vehicle Section */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle & Brand</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Brand</Label>
                  <Select value={brand} onValueChange={setBrand}>
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
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Section */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>MSRP</Label>
                  <Input
                    type="number"
                    value={msrp}
                    onChange={(e) => setMsrp(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Selling Price</Label>
                  <Input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                  />
                  <p className="text-sm text-green-600 mt-1">
                    Discount from MSRP: ${discount.toLocaleString()}
                  </p>
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
                    <Label>Term (months)</Label>
                    <Select value={termMonths.toString()} onValueChange={(v) => setTermMonths(parseInt(v))}>
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
                    <Select value={annualMileage.toString()} onValueChange={(v) => setAnnualMileage(parseInt(v))}>
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
                
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Fees & Down Payment */}
            <Card>
              <CardHeader>
                <CardTitle>Fees & Down Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Down Payment</Label>
                  <Input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="zeroDriveOff"
                    checked={zeroDriveOff}
                    onChange={(e) => setZeroDriveOff(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="zeroDriveOff">Zero Drive-Off</Label>
                </div>
              </CardContent>
            </Card>

            <Button onClick={calculateLease} className="w-full" disabled={loading}>
              {loading ? 'Calculating...' : 'Calculate Lease'}
            </Button>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {result ? (
              <>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-2xl">Deal Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-6 text-center">
                        <div className="text-5xl font-bold text-blue-600">
                          ${result.monthly_payment_with_tax.toFixed(2)}
                        </div>
                        <div className="text-gray-600 mt-2">per month (incl. tax)</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <div className="text-sm text-gray-600">Drive-Off</div>
                          <div className="text-2xl font-bold">
                            ${result.estimated_drive_off.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4">
                          <div className="text-sm text-gray-600">One-Pay</div>
                          <div className="text-2xl font-bold">
                            ${result.one_pay_estimated.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Program Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Money Factor:</span>
                      <span className="font-semibold">{result.mf_used.toFixed(5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Residual:</span>
                      <span className="font-semibold">
                        {result.residual_percent_used}% (${result.residual_value.toFixed(0)})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Incentives:</span>
                      <span className="font-semibold text-green-600">
                        ${result.total_incentives_applied.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Savings vs MSRP deal:</span>
                      <span className="font-semibold text-green-600">
                        ${result.estimated_savings_vs_msrp_deal.toFixed(0)} over {result.term_months}mo
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                  <CardContent className="pt-6">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                      onClick={() => {
                        const message = `Hi, I want this deal: ${brand} ${model}, ${termMonths}mo, $${result.monthly_payment_with_tax.toFixed(2)}/mo`;
                        window.open(`https://t.me/SalesAzatAuto?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                    >
                      💬 Get this deal via Telegram
                    </Button>
                  </CardContent>
                </Card>

                <div className="text-sm text-gray-500 text-center">
                  All payments are estimates. Final figures depend on credit approval,
                  bank program changes, and exact fees.
                </div>
              </>
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="py-12 text-center text-gray-500">
                  <div className="text-4xl mb-4">🧮</div>
                  <div>Fill in the details and click "Calculate Lease" to see results</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
