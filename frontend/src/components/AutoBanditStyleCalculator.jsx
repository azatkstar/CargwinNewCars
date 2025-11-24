import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ReserveModal from './ReserveModal';
import PriceBreakdownModal from './PriceBreakdownModal';
import QualifyCheckModal from './QualifyCheckModal';
import { Info } from 'lucide-react';

const AutoBanditStyleCalculator = ({ car }) => {
  const [params, setParams] = useState({
    termMonths: 36,
    annualMileage: 10000,
    creditTier: 'SUPER_ELITE',
    dueAtSigning: 2500,
    zipCode: '90210',
    dealType: 'lease',
    customerDownPayment: 2500,
    withIncentives: true
  });
  
  const [calculated, setCalculated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [showQualifyCheck, setShowQualifyCheck] = useState(false);
  const [taxRate, setTaxRate] = useState(7.75);
  
  // Down payment options до $15k
  const downPaymentOptions = [0, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000, 12000, 15000];

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
  }, [params, car]);

  const calculateLease = async () => {
    if (!car?.id) return;
    
    setLoading(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
      const endpoint = BACKEND_URL.endsWith('/api')
        ? `${BACKEND_URL}/calc/lease`
        : `${BACKEND_URL}/api/calc/lease`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealExternalId: car.id,
          termMonths: params.termMonths,
          annualMileage: params.annualMileage,
          creditTierCode: params.creditTier,
          withIncentives: params.withIncentives,
          customer_down_payment: params.customerDownPayment
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setCalculated({
          monthly: data.monthly,
          dueAtSigning: data.dueAtSigning,
          residualValue: data.residualValue,
          moneyFactor: data.moneyFactor,
          lender: 'Toyota Financial Services'  // From car data
        });
      } else {
        // Fallback to old calculation
        calculateLeaseOld();
      }
    } catch (error) {
      console.error('Calc error:', error);
      calculateLeaseOld();
    } finally {
      setLoading(false);
    }
  };

  const calculateLeaseOld = () => {
    // Existing calculation as fallback
    const msrp = car?.msrp || 50000;
    const sellingPrice = car?.fleet || (msrp - (car?.savings || 0));
    
    const residualPercents = { 24: 64, 36: 57, 39: 55, 48: 50 };
    const residualPercent = residualPercents[params.termMonths] || 57;
    const residualValue = Math.round(msrp * (residualPercent / 100));
    
    const baseMF = 0.00182;
    const moneyFactor = baseMF;
    
    const depreciation = (sellingPrice - residualValue) / params.termMonths;
    const financeCharge = (sellingPrice + residualValue) * moneyFactor;
    const baseMonthly = Math.round(depreciation + financeCharge);
    
    setCalculated({
      monthly: baseMonthly,
      dueAtSigning: params.customerDownPayment + 650 + 540 + 85 + baseMonthly,
      residualValue,
      moneyFactor: moneyFactor.toFixed(5),
      lender: car?.make === 'Toyota' ? 'Toyota Financial' : 'Manufacturer Finance'
    });
  };

  if (!calculated) return null;

  return (
    <>
    <Card className="border-2 border-gray-200 bg-white shadow-lg">
      <CardContent className="p-4 space-y-4">
        {/* Tab Switches - КОМПАКТНЕЕ */}
        <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setParams({...params, dealType: 'lease'})}
            className={`py-2 px-3 rounded-md font-bold text-sm transition-all ${
              params.dealType === 'lease'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            LEASE
          </button>
          <button
            onClick={() => setParams({...params, dealType: 'finance'})}
            className={`py-2 px-3 rounded-md font-bold text-sm transition-all ${
              params.dealType === 'finance'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            FINANCE
          </button>
        </div>

        {/* Selectors Grid - КОМПАКТНЕЕ */}
        <div className="grid grid-cols-2 gap-3">
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

          {/* Down Payment - До $15k */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">DOWN PAYMENT</div>
            <Select value={params.customerDownPayment.toString()} onValueChange={(val) => setParams({...params, customerDownPayment: parseInt(val)})}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {downPaymentOptions.map(amt => (
                  <SelectItem key={amt} value={amt.toString()}>
                    ${amt.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Incentives Toggle */}
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
          <span className="text-sm font-medium">Apply available incentives</span>
          <button
            onClick={() => setParams({...params, withIncentives: !params.withIncentives})}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              params.withIncentives ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              params.withIncentives ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* MONTHLY PAYMENT DISPLAY - КОМПАКТНЕЕ */}
        <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 text-center">
          {loading ? (
            <div className="py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            </div>
          ) : calculated ? (
            <>
              <div className="text-xs text-gray-600 mb-1">{calculated.lender}</div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                ${calculated.monthly}
              </div>
              <div className="text-sm text-gray-600 mb-2">per month</div>
              <div className="text-xs text-gray-600">
                +${calculated.dueAtSigning?.toLocaleString()} due at signing
              </div>
            </>
          ) : (
            <div className="text-gray-500">Calculating...</div>
          )}
        </div>
        
        {/* Price includes taxes */}
        <p className="text-xs text-center text-gray-600">
          Price includes taxes & DMV fees
        </p>

        {/* CHECK IF YOU QUALIFY - ПЕРЕД RESERVE */}
        <Button
          variant="outline"
          onClick={() => setShowQualifyCheck(true)}
          className="w-full border-2 border-blue-500 text-blue-700 hover:bg-blue-50 py-3"
        >
          Check if you qualify — 30 seconds, no impact to credit score
        </Button>

        {/* LEASE IT NOW Button */}
        <Button
          onClick={() => setShowReserveModal(true)}
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 text-lg font-bold rounded-xl shadow-lg"
        >
          {loading ? 'CALCULATING...' : 'LEASE IT NOW'}
        </Button>
        
        {/* Trust text under button */}
        <p className="text-xs text-center text-gray-600">
          No payment today. Free 24h price hold. Cancel anytime before final contract.
        </p>
        
        {/* Price Transparency Button */}
        <Button
          variant="outline"
          onClick={() => setShowPriceBreakdown(true)}
          className="w-full border-2 border-blue-500 text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-2"
        >
          <Info className="w-4 h-4" />
          Price Transparency - Full Breakdown
        </Button>
        
        {/* Details */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Residual Value:</span>
            <span className="font-medium">${calculated?.residualValue?.toLocaleString() || '0'}</span>
          </div>
          <div className="flex justify-between">
            <span>Money Factor:</span>
            <span className="font-medium">{calculated?.moneyFactor || '0.00200'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
    
    {/* MODALS - OUTSIDE Card для избежания DOM errors */}
    {showReserveModal && car && (
      <ReserveModal
        isOpen={showReserveModal}
        onClose={() => setShowReserveModal(false)}
        offer={car}
        paymentMode="lease"
      />
    )}
    
    {showPriceBreakdown && car && (
      <PriceBreakdownModal
        isOpen={showPriceBreakdown}
        onClose={() => setShowPriceBreakdown(false)}
        car={car}
      />
    )}
    
    {showQualifyCheck && (
      <QualifyCheckModal
        isOpen={showQualifyCheck}
        onClose={() => setShowQualifyCheck(false)}
        carTitle={car?.title}
      />
    )}
    </>
  );
};

export default AutoBanditStyleCalculator;
