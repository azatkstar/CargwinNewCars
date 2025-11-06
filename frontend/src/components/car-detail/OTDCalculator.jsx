import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calculator, TrendingUp } from 'lucide-react';
import { formatPrice } from '../../utils/timer';

const OTDCalculator = ({ car }) => {
  const [formData, setFormData] = useState({
    msrp: car.msrp,
    state: 'CA',
    creditScore: '',
    downPayment: 0,
    term: 60
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateOTD = async () => {
    setLoading(true);
    
    try {
      // Fetch real tax/fees data from API
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/tax-fees/${formData.state}`);
      const taxData = await response.json();
      
      // Calculate tax and fees
      const salesTax = car.fleet * (taxData.sales_tax_rate / 100);
      const dmvFees = taxData.dmv_registration || 0;
      const titleFee = taxData.title_fee || 0;
      const docFee = taxData.doc_fee || 0;
      const otherFees = (taxData.tire_fee || 0) + (taxData.smog_fee || 0) + (taxData.inspection_fee || 0);
      const totalFees = dmvFees + titleFee + docFee + otherFees;
      const estOtdoor = car.fleet + salesTax + totalFees;
      
      // APR based on credit score
      let apr = 4.5;
      if (formData.creditScore === 'excellent') apr = 2.9;
      else if (formData.creditScore === 'good') apr = 3.5;
      else if (formData.creditScore === 'fair') apr = 5.5;
      else if (formData.creditScore === 'poor') apr = 7.5;
      else if (formData.creditScore === 'bad') apr = 12.0;

      const monthlyPayment = calculateMonthlyPayment(
        estOtdoor - formData.downPayment,
        apr,
        formData.term
      );

      setResults({
        estOtdoor,
        tax: salesTax,
        fees: totalFees,
        apr,
        monthlyPayment,
        taxData: {
          salesTaxRate: taxData.sales_tax_rate,
          dmvFees,
          titleFee,
          docFee,
          otherFees,
          stateName: taxData.state_name,
          localTaxNote: taxData.local_tax_note
        }
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Tax calculation error:', error);
      // Fallback to default calculation
      const baseTax = car.fleet * 0.0725;
      const fees = 500;
      const estOtdoor = car.fleet + baseTax + fees;
      
      let apr = 4.5;
      if (formData.creditScore === 'excellent') apr = 2.9;
      else if (formData.creditScore === 'good') apr = 3.5;
      else if (formData.creditScore === 'fair') apr = 5.5;
      else if (formData.creditScore === 'poor') apr = 7.5;
      else if (formData.creditScore === 'bad') apr = 12.0;

      const monthlyPayment = calculateMonthlyPayment(
        estOtdoor - formData.downPayment,
        apr,
        formData.term
      );

      setResults({
        estOtdoor,
        tax: baseTax,
        fees,
        apr,
        monthlyPayment
      });
      
      setLoading(false);
    }
  };

  const calculateMonthlyPayment = (principal, apr, termMonths) => {
    const monthlyRate = apr / 100 / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                   (Math.pow(1 + monthlyRate, termMonths) - 1);
    return Math.round(payment);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-red-600" />
          Out-The-Door (OTD) Price Calculator
        </CardTitle>
        <p className="text-gray-600">
          Calculate final price including taxes and fees
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="msrp">MSRP</Label>
            <Input
              id="msrp"
              type="number"
              value={formData.msrp}
              onChange={(e) => handleInputChange('msrp', parseInt(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="state">State</Label>
            <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="NV">Nevada</SelectItem>
                <SelectItem value="AZ">Arizona</SelectItem>
                <SelectItem value="OR">Oregon</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="creditScore">Credit Score</Label>
            <Select value={formData.creditScore} onValueChange={(value) => handleInputChange('creditScore', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent (750+)</SelectItem>
                <SelectItem value="good">Good (700-749)</SelectItem>
                <SelectItem value="fair">Fair (650-699)</SelectItem>
                <SelectItem value="poor">Poor (600-649)</SelectItem>
                <SelectItem value="bad">Very Poor (&lt;600)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="downPayment">Down Payment ($)</Label>
            <Input
              id="downPayment"
              type="number"
              value={formData.downPayment}
              onChange={(e) => handleInputChange('downPayment', parseInt(e.target.value) || 0)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="term">Loan Term (months)</Label>
            <Select value={formData.term.toString()} onValueChange={(value) => handleInputChange('term', parseInt(value))}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="36">36 months</SelectItem>
                <SelectItem value="48">48 months</SelectItem>
                <SelectItem value="60">60 months</SelectItem>
                <SelectItem value="72">72 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calculate Button */}
        <Button
          onClick={calculateOTD}
          disabled={!formData.creditScore || loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 py-3 text-lg font-semibold"
        >
          {loading ? 'Calculating...' : 'Calculate OTD Price'}
        </Button>

        {/* Results */}
        {results && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">Результаты расчета</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Fleet-цена:</span>
                  <span className="font-semibold">{formatPrice(car.fleet)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    Sales Tax ({results.taxData?.salesTaxRate || '7.25'}% - {results.taxData?.stateName || formData.state}):
                  </span>
                  <span className="font-semibold">{formatPrice(results.tax)}</span>
                </div>
                {results.taxData && (
                  <>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="pl-3">• DMV Registration:</span>
                      <span>{formatPrice(results.taxData.dmvFees)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="pl-3">• Title Fee:</span>
                      <span>{formatPrice(results.taxData.titleFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="pl-3">• Doc Fee:</span>
                      <span>{formatPrice(results.taxData.docFee)}</span>
                    </div>
                    {results.taxData.otherFees > 0 && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span className="pl-3">• Other Fees:</span>
                        <span>{formatPrice(results.taxData.otherFees)}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between font-medium">
                  <span className="text-gray-700">Total Fees:</span>
                  <span className="font-semibold">{formatPrice(results.fees)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Итого OTD:</span>
                    <span className="text-lg font-bold text-green-600">{formatPrice(results.estOtdoor)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">APR:</span>
                  <span className="font-semibold">{results.apr}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Первый взнос:</span>
                  <span className="font-semibold">{formatPrice(formData.downPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Срок:</span>
                  <span className="font-semibold">{formData.term} мес.</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Ежемесячно:</span>
                    <span className="text-lg font-bold text-blue-600">{formatPrice(results.monthlyPayment)}/мес</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> This calculation is preliminary. Final terms depend on credit approval and may vary.
                Exact terms will be provided after credit history verification.
              </p>
              {results.taxData?.localTaxNote && (
                <p className="text-xs text-gray-600">
                  <strong>Tax Info:</strong> {results.taxData.localTaxNote}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OTDCalculator;