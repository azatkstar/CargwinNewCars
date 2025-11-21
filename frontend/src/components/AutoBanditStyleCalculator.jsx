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
    zipCode: '90210',
    dealType: 'lease'  // lease or finance
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
    const salesTaxRate = taxRate / 100; // Dynamic from zip code
    
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
    <Card className="border-2 border-gray-200 bg-white shadow-xl sticky top-4">
      <CardContent className="p-6 space-y-6">
        {/* Tab Switches - LEASE / FINANCE */}
        <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setParams({...params, dealType: 'lease'})}
            className={`py-3 px-4 rounded-md font-bold transition-all ${
              params.dealType === 'lease'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            LEASE
          </button>
          <button
            onClick={() => setParams({...params, dealType: 'finance'})}
            className={`py-3 px-4 rounded-md font-bold transition-all ${
              params.dealType === 'finance'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            FINANCE
          </button>
        </div>

        {/* Selectors Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Term Length */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">TERM LENGTH</div>
            <Select value={params.termMonths.toString()} onValueChange={(val) => setParams({...params, termMonths: parseInt(val)})}>
              <SelectTrigger className="border-gray-300">
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
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">ANNUAL MILEAGE</div>
            <Select value={params.annualMileage.toString()} onValueChange={(val) => setParams({...params, annualMileage: parseInt(val)})}>
              <SelectTrigger className="border-gray-300">
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
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">CREDIT TIER</div>
            <Select value={params.creditTier} onValueChange={(val) => setParams({...params, creditTier: val})}>
              <SelectTrigger className="border-gray-300">
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

          {/* Due at Signing */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">DUE AT SIGNING</div>
            <Select value={params.dueAtSigning.toString()} onValueChange={(val) => setParams({...params, dueAtSigning: parseInt(val)})}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">$0</SelectItem>
                <SelectItem value="1000">$1,000</SelectItem>
                <SelectItem value="1500">$1,500</SelectItem>
                <SelectItem value="2000">$2,000</SelectItem>
                <SelectItem value="2500">$2,500</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* LEASE IT NOW Section - COMMERCIAL */}
        <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6">
          <div className="text-center mb-6">
            <div className="text-sm text-gray-600 mb-2">
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
                </svg>
                {calculated.lender}
              </span>
            </div>
            
            <div className="text-6xl font-bold text-gray-900 mb-2">
              ${calculated.monthly}
            </div>
            
            <div className="text-lg text-gray-600 mb-4">
              per month
            </div>
            
            <div className="text-sm text-gray-600">
              (+${calculated.dueAtSigning.toLocaleString()} due at signing)
            </div>
          </div>

          {/* BIG RED BUTTON */}
          <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-6 text-xl font-bold rounded-xl shadow-lg">
            LEASE IT NOW
          </Button>
        </div>

        {/* Details Breakdown */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Residual Value:</span>
            <span className="font-medium">${calculated.residualValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Money Factor:</span>
            <span className="font-medium">{calculated.moneyFactor}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutoBanditStyleCalculator;
