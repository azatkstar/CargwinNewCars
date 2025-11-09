import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { DollarSign, TrendingDown } from 'lucide-react';

const SavingsCalculator = () => {
  const [competitorQuote, setCompetitorQuote] = useState('');
  const ourPrice = 18772; // Example fleet price
  const savings = competitorQuote ? (parseFloat(competitorQuote) - ourPrice) : 0;
  const savingsPercent = competitorQuote ? ((savings / parseFloat(competitorQuote)) * 100).toFixed(1) : 0;

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <TrendingDown className="w-5 h-5" />
          Savings Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="competitor-quote">Enter competitor quote ($)</Label>
            <Input
              id="competitor-quote"
              type="number"
              placeholder="e.g., 25000"
              value={competitorQuote}
              onChange={(e) => setCompetitorQuote(e.target.value)}
              className="text-lg"
            />
          </div>

          {competitorQuote && savings > 0 && (
            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-300">
              <div className="text-center">
                <div className="text-sm text-green-700 mb-2">You save with us:</div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  ${savings.toLocaleString()}
                </div>
                <div className="text-lg text-green-700">
                  That's {savingsPercent}% less!
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-green-200 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Competitor Quote</div>
                  <div className="font-semibold">${parseFloat(competitorQuote).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Our Fleet Price</div>
                  <div className="font-semibold text-green-700">${ourPrice.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500">
            * Based on typical Lexus RX350 pricing. Actual savings vary by model and trim.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavingsCalculator;