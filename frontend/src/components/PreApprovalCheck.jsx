import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CheckCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PreApprovalCheck = () => {
  const [income, setIncome] = useState('');
  const [creditRange, setCreditRange] = useState('');
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const handleCheck = () => {
    if (income && creditRange) {
      setShowResult(true);
    }
  };

  const calculatePreApproval = () => {
    const incomeNum = parseFloat(income);
    // Conservative: 20% of annual income for car budget
    const maxBudget = Math.round((incomeNum * 0.20) / 1000) * 1000;
    
    const aprByCredit = {
      '720-850': 5.99,
      '680-719': 8.99,
      '640-679': 11.99,
      '600-639': 14.99
    };
    
    return {
      maxBudget,
      apr: aprByCredit[creditRange] || 9.75
    };
  };

  const result = showResult ? calculatePreApproval() : null;

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Shield className="w-5 h-5" />
          Pre-Qualification Check
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Soft credit check - won't affect your score
        </p>
      </CardHeader>
      <CardContent>
        {!showResult ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="income">Annual Income ($)</Label>
              <Input
                id="income"
                type="number"
                placeholder="e.g., 75000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="credit-range">Credit Score Range</Label>
              <Select value={creditRange} onValueChange={setCreditRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720-850">720-850 (Excellent)</SelectItem>
                  <SelectItem value="680-719">680-719 (Good)</SelectItem>
                  <SelectItem value="640-679">640-679 (Fair)</SelectItem>
                  <SelectItem value="600-639">600-639 (Poor)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCheck}
              disabled={!income || !creditRange}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Check My Pre-Qualification
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-300 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-green-900 mb-2">
                You're Pre-Qualified!
              </h3>
              <p className="text-gray-600 mb-4">
                Based on your income and credit score
              </p>
              
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Maximum Vehicle Budget</div>
                  <div className="text-3xl font-bold text-green-600">
                    ${result.maxBudget.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Your Estimated APR</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {result.apr}%
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowResult(false)}
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                See Matching Cars
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              * This is an estimate. Final approval depends on credit check and lender review.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PreApprovalCheck;