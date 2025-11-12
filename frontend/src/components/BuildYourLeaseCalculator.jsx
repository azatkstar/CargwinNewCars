import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calculator, TrendingDown, Home as HomeIcon } from 'lucide-react';

const BuildYourLeaseCalculator = ({ car, zipCode = '90210' }) => {
  const [params, setParams] = useState({
    cashDown: 5000,
    termMonths: 36,
    annualMileage: 7500,
    creditTier: 'tier1'
  });
  
  const [calculated, setCalculated] = useState(null);

  // Options
  const cashDownOptions = [0, 1000, 2000, 3000, 5000, 7000, 10000];
  const termOptions = [24, 36, 48];
  const mileageOptions = [7500, 10000, 12000, 15000];
  const creditTiers = {
    'tier1': { label: 'Tier 1 (740+)', moneyFactorAdjust: 0 },
    'tier2': { label: 'Tier 2 (680-739)', moneyFactorAdjust: 0.0002 },
    'tier3': { label: 'Tier 3 (640-679)', moneyFactorAdjust: 0.0005 },
    'tier4': { label: 'Tier 4 (600-639)', moneyFactorAdjust: 0.0008 }
  };

  useEffect(() => {
    calculateLease();
  }, [params, car]);

  const calculateLease = () => {
    if (!car) return;

    const msrp = car.msrp || 50000;
    const sellingPrice = car.fleet || (msrp - (car.savings || 0));
    
    // Base money factor from APR (usually around 0.00197 for good credit)
    const baseMoneyFactor = 0.00197;
    const tierAdjust = creditTiers[params.creditTier].moneyFactorAdjust;
    const moneyFactor = baseMoneyFactor + tierAdjust;
    
    // Residual value based on term
    const residualPercents = {
      24: 62,  // 62% for 24 months
      36: 55,  // 55% for 36 months
      48: 48   // 48% for 48 months
    };
    const residualPercent = residualPercents[params.termMonths] || 55;
    const residualValue = Math.round(msrp * (residualPercent / 100));
    
    // Mileage adjustment (higher mileage = lower residual)
    const mileageAdjust = {
      7500: 0,
      10000: -0.02,
      12000: -0.04,
      15000: -0.06
    }[params.annualMileage] || 0;
    
    const adjustedResidual = Math.round(residualValue * (1 + mileageAdjust));
    
    // Monthly depreciation
    const depreciation = (sellingPrice - adjustedResidual) / params.termMonths;
    
    // Monthly finance charge
    const financeCharge = (sellingPrice + adjustedResidual) * moneyFactor;
    
    // Base monthly payment
    const baseMonthly = Math.round(depreciation + financeCharge);
    
    // Fees (California specific)
    const acquisitionFee = 595;
    const registrationFee = 580;
    const docFee = 85;
    const salesTaxRate = 0.0875; // 8.75% for LA
    
    // Due at signing calculation
    const firstMonthly = baseMonthly;
    const downPaymentTax = Math.round(params.cashDown * salesTaxRate);
    const otherTax = Math.round((acquisitionFee + registrationFee) * salesTaxRate);
    const taxOnFees = Math.round(docFee * salesTaxRate);
    
    const dueAtSigning = firstMonthly + params.cashDown + downPaymentTax + 
                         acquisitionFee + registrationFee + otherTax + docFee + taxOnFees;
    
    // Total lease cost
    const totalCost = (baseMonthly * params.termMonths) + dueAtSigning;
    
    // Savings vs original MSRP
    const msrpMonthly = Math.round((msrp - adjustedResidual) / params.termMonths + ((msrp + adjustedResidual) * moneyFactor));
    const monthlySavings = msrpMonthly - baseMonthly;

    setCalculated({
      monthly: baseMonthly,
      dueAtSigning,
      residualValue: adjustedResidual,
      moneyFactor: moneyFactor.toFixed(5),
      equivalentAPR: (moneyFactor * 2400).toFixed(2),
      totalCost,
      monthlySavings,
      breakdown: {
        firstMonthly,
        downPaymentTax,
        acquisitionFee,
        registrationFee,
        otherTax,
        docFee,
        taxOnFees
      }
    });
  };

  if (!calculated) return null;

  return (
    <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-green-700 text-sm mb-1">
              <TrendingDown className="w-4 h-4" />
              Lease Savings: ${calculated.monthlySavings}/month
            </div>
            <div className="text-4xl font-bold text-gray-900">
              ${calculated.monthly}<span className="text-xl text-gray-600">/mo</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Congratulations, you're saving ${calculated.monthlySavings}/mo on this lease. Home delivery included.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <div className="flex items-center gap-2 text-sm text-blue-900 mb-2">
            <HomeIcon className="w-4 h-4" />
            <span className="font-medium">{zipCode} - Beverly Hills, CA</span>
          </div>
        </div>

        <CardTitle className="text-lg">Build Your Lease</CardTitle>

        {/* Cash Down */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Cash Down</span>
            <span className="text-gray-600">${params.cashDown.toLocaleString()}</span>
          </div>
          <Select 
            value={params.cashDown.toString()} 
            onValueChange={(val) => setParams({...params, cashDown: parseInt(val)})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cashDownOptions.map(amount => (
                <SelectItem key={amount} value={amount.toString()}>
                  ${amount.toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Term Length */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Term Length</span>
            <span className="text-gray-600">{params.termMonths} months</span>
          </div>
          <Select 
            value={params.termMonths.toString()} 
            onValueChange={(val) => setParams({...params, termMonths: parseInt(val)})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {termOptions.map(term => (
                <SelectItem key={term} value={term.toString()}>
                  {term} months
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Annual Mileage */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Annual Mileage</span>
            <span className="text-gray-600">{params.annualMileage.toLocaleString()} miles</span>
          </div>
          <Select 
            value={params.annualMileage.toString()} 
            onValueChange={(val) => setParams({...params, annualMileage: parseInt(val)})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mileageOptions.map(miles => (
                <SelectItem key={miles} value={miles.toString()}>
                  {miles.toLocaleString()} miles
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Credit Tier */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Est. Credit Tier</span>
            <span className="text-gray-600">{creditTiers[params.creditTier].label}</span>
          </div>
          <Select 
            value={params.creditTier} 
            onValueChange={(val) => setParams({...params, creditTier: val})}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(creditTiers).map(([key, tier]) => (
                <SelectItem key={key} value={key}>
                  {tier.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lease Details */}
        <div className="bg-gray-50 p-4 rounded border space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Due at Signing</span>
            <span className="font-semibold">${calculated.dueAtSigning.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Residual Value</span>
            <span className="font-semibold">${calculated.residualValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Money Factor</span>
            <span className="font-semibold">{calculated.moneyFactor} (≈{calculated.equivalentAPR}% APR)</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="font-medium">Total Lease Cost</span>
            <span className="font-bold text-lg">${calculated.totalCost.toLocaleString()}</span>
          </div>
        </div>

        {/* Special Incentives */}
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Special Incentives</p>
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-900">Lexus Fleet Discount</span>
              <span className="text-sm font-semibold text-green-700">Included</span>
            </div>
          </div>
        </div>

        {/* Home Delivery */}
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-blue-900">Home Delivery</span>
            <span className="text-sm font-semibold text-blue-700">Included</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">Estimated Delivery to {zipCode}</span>
            <span className="text-sm font-semibold text-blue-700">0-2 Days</span>
          </div>
        </div>

        {/* Deposit */}
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-900">Deposit Due Today</span>
            <span className="text-xl font-bold text-yellow-700">$97.49</span>
          </div>
        </div>

        {/* Reserve Button */}
        <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
          Next Step: Reserve Car
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Lease terms secured through Cargwin using dealer-provided discounts and manufacturer programs. 
          Final approval by dealer & lender.
        </p>
      </CardContent>
    </Card>
  );
};

export default BuildYourLeaseCalculator;
