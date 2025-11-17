import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Info } from 'lucide-react';

const AutoBanditStyleCalculator = ({ car }) => {
  const [params, setParams] = useState({
    termMonths: 36,
    annualMileage: 10000,
    creditTier: 'tier1',
    dueAtSigning: 1580,
    zipCode: '90210'  // Beverly Hills default
  });
  
  const [calculated, setCalculated] = useState(null);
  const [taxRate, setTaxRate] = useState(7.75);

  // Credit Tier adjustments (как AutoBandit)
  const creditTiers = {
    'tier1': { label: 'Super Elite 740+', moneyFactorBase: 0.00182 },
    'tier2': { label: 'Elite 720-739', moneyFactorBase: 0.00197 },
    'tier3': { label: 'Excellent 700-719', moneyFactorBase: 0.00212 },
    'tier4': { label: 'Good 680-699', moneyFactorBase: 0.00227 }
  };


  const fetchTaxRate = async (zip) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/tax-rate/${zip}`);
      if (response.ok) {
        const data = await response.json();
        setTaxRate(data.tax_rate);
      }
    } catch (error) {
      console.error('Tax rate lookup failed:', error);
    }
  };


  // Term options (как AutoBandit)
  const termOptions = [
    { months: 24, label: '24 months' },
    { months: 36, label: '36 months' },
    { months: 39, label: 'Best - 39 months' },
    { months: 48, label: '48 months' }
  ];

  // Mileage options
  const mileageOptions = [7500, 10000, 12000, 15000];

  useEffect(() => {
    calculateLease();
    // Fetch tax rate for zip code
    if (params.zipCode && params.zipCode.length === 5) {
      fetchTaxRate(params.zipCode);
    }
  }, [params, car]);

  const calculateLease = () => {
    if (!car) return;

    const msrp = car.msrp || 34288;
    const sellingPrice = car.fleet || (msrp - (car.savings || 0));
    
    // Residual % based on term (AutoBandit формулы)
    const residualPercents = {
      24: 64,  // 64% for 24mo
      36: 57,  // 57% for 36mo
      39: 55,  // 55% for 39mo
      48: 50   // 50% for 48mo
    };
    
    const residualPercent = residualPercents[params.termMonths] || 57;
    const residualValue = Math.round(msrp * (residualPercent / 100));
    
    // Money Factor (с учётом credit tier)
    const baseMF = creditTiers[params.creditTier].moneyFactorBase;
    
    // Mileage adjustment
    const mileageAdjust = {
      7500: -0.00005,
      10000: 0,
      12000: 0.00005,
      15000: 0.0001
    }[params.annualMileage] || 0;
    
    const moneyFactor = baseMF + mileageAdjust;
    
    // Monthly depreciation
    const depreciation = (sellingPrice - residualValue) / params.termMonths;
    
    // Monthly finance charge
    const financeCharge = (sellingPrice + residualValue) * moneyFactor;
    
    // Base monthly payment
    const baseMonthly = Math.round(depreciation + financeCharge);
    
    // California fees (как AutoBandit)
    const acquisitionFee = 650;  // Toyota standard
    const registrationFee = 540;
    const docFee = 85;
    const salesTaxRate = 0.0775; // 7.75% CA
    
    // Due at Signing breakdown (AutoBandit style)
    const firstMonthlyPayment = baseMonthly;
    const otherTax = Math.round((acquisitionFee + registrationFee) * salesTaxRate);
    const taxOnFees = Math.round(docFee * salesTaxRate);
    
    const calculatedDueAtSigning = firstMonthlyPayment + acquisitionFee + 
                                    registrationFee + otherTax + docFee + taxOnFees;
    
    // Total lease cost
    const totalCost = (baseMonthly * params.termMonths) + calculatedDueAtSigning;
    
    // APR equivalent
    const equivalentAPR = (moneyFactor * 2400).toFixed(2);

    setCalculated({
      monthly: baseMonthly,
      dueAtSigning: calculatedDueAtSigning,
      residualValue,
      moneyFactor: moneyFactor.toFixed(5),
      equivalentAPR,
      totalCost,
      breakdown: {
        firstMonthlyPayment,
        acquisitionFee,
        registrationFee,
        otherTax,
        docFee,
        taxOnFees
      },
      lender: car.make === 'Toyota' ? 'Toyota Financial Services' : 
              car.make === 'Lexus' ? 'Lexus Financial Services' :
              car.make === 'BMW' ? 'BMW Financial Services' : 'Manufacturer Finance'
    });
  };

  if (!calculated) return null;

  return (
    <Card className="border-2 border-green-300 bg-white shadow-xl">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center pb-4 border-b">
          <div className="text-sm text-gray-600 mb-1">Monthly payment</div>
          <div className="text-sm text-gray-500 mb-2">{calculated.lender}</div>
          <div className="text-5xl font-bold text-gray-900 mb-2">
            ${calculated.monthly}
            <span className="text-xl text-gray-600"> per month</span>
          </div>
          <div className="text-sm text-gray-600">
            (+${calculated.dueAtSigning.toLocaleString()} due at signing)
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Term Length */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">TERM LENGTH</span>
            </div>
            <Select 
              value={params.termMonths.toString()} 
              onValueChange={(val) => setParams({...params, termMonths: parseInt(val)})}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {termOptions.map(opt => (
                  <SelectItem key={opt.months} value={opt.months.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Annual Mileage */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">ANNUAL MILEAGE</span>
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
                    {miles.toLocaleString()} mi
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Credit Tier */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">CREDIT TIER</span>
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
        </div>

        {/* Price Transparency Button */}
        <Button 
          variant="outline"
          className="w-full border-2 border-blue-500 text-blue-700 hover:bg-blue-50"
          onClick={() => {/* Open detailed breakdown */}}
        >
          <Info className="w-4 h-4 mr-2" />
          Price Transparency - See Full Breakdown
        </Button>

        {/* Quick Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Residual Value:</span>
            <span className="font-semibold">${calculated.residualValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Money Factor:</span>
            <span className="font-semibold">{calculated.moneyFactor} (≈{calculated.equivalentAPR}% APR)</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">Total Lease Cost:</span>
            <span className="font-bold text-lg">${calculated.totalCost.toLocaleString()}</span>
          </div>
        </div>

        {/* LEASE IT NOW Button */}
        <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold">
          RESERVE NOW - ${calculated.monthly}/mo
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Prices shown for {creditTiers[params.creditTier].label} credit. 
          Actual rate depends on credit approval.
        </p>
      </CardContent>
    </Card>
  );
};

export default AutoBanditStyleCalculator;
