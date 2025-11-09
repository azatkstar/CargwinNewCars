import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calculator, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InstantQuoteTool = () => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const navigate = useNavigate();

  const makes = ['Lexus', 'Toyota', 'Honda', 'BMW', 'Mercedes-Benz'];
  const modelsByMake = {
    'Lexus': ['RX350', 'TX350', 'ES350', 'NX350', 'NX450h'],
    'Toyota': ['Camry', 'RAV4', 'Highlander', 'Tacoma'],
    'Honda': ['Accord', 'CR-V', 'Pilot', 'Civic'],
    'BMW': ['X5', 'X3', '3 Series', '5 Series'],
    'Mercedes-Benz': ['GLE', 'GLC', 'C-Class', 'E-Class']
  };
  const creditRanges = ['720-850', '680-719', '640-679', '600-639'];

  const handleGetQuote = () => {
    if (make && model) {
      // Navigate to offers with filter
      navigate('/', { state: { filterMake: make, filterModel: model } });
      // Scroll to offers
      setTimeout(() => {
        document.getElementById('offers')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const estimateAPR = (range) => {
    const aprMap = {
      '720-850': '5.99-7.99',
      '680-719': '8.99-10.99',
      '640-679': '11.99-13.99',
      '600-639': '14.99-17.99'
    };
    return aprMap[range] || '9.75';
  };

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text */}
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-4">
              Get Your Instant Quote
            </h2>
            <p className="text-xl text-red-100 mb-6">
              See your personalized pricing and payment in seconds. No registration required.
            </p>
            <div className="flex items-center gap-4 text-red-100">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                <span>Instant calculation</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                <span>No commitment</span>
              </div>
            </div>
          </div>

          {/* Right: Quote Form */}
          <Card className="shadow-2xl">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Make *
                  </label>
                  <Select value={make} onValueChange={(val) => { setMake(val); setModel(''); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select make..." />
                    </SelectTrigger>
                    <SelectContent>
                      {makes.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Model *
                  </label>
                  <Select value={model} onValueChange={setModel} disabled={!make}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(modelsByMake[make] || []).map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Credit Score Range
                  </label>
                  <Select value={creditScore} onValueChange={setCreditScore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select range..." />
                    </SelectTrigger>
                    <SelectContent>
                      {creditRanges.map(range => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {creditScore && (
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <p className="text-blue-900">
                      <span className="font-semibold">Your estimated APR:</span> {estimateAPR(creditScore)}%
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleGetQuote}
                  disabled={!make || !model}
                  className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
                >
                  See Your Price
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <p className="text-xs text-center text-gray-500">
                  No credit impact • Instant results • No obligation
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InstantQuoteTool;
