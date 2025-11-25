import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import ReserveModal from './ReserveModal';
import PriceBreakdownModal from './PriceBreakdownModal';
import QualifyCheckModal from './QualifyCheckModal';
import { Info } from 'lucide-react';
import { usePaymentCalculator } from '../hooks/usePaymentCalculator';

const AutoBanditStyleCalculator = ({ car }) => {
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [showQualifyCheck, setShowQualifyCheck] = useState(false);

  // Use payment calculator hook
  const {
    config,
    loading,
    error,
    params,
    updateParam,
    switchMode,
    calculation
  } = usePaymentCalculator(car?.id || car?.slug);
  // Show loading or error state
  if (loading) {
    return (
      <Card className="border-2 border-gray-200 bg-white shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Loading calculator...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !config) {
    return (
      <Card className="border-2 border-gray-200 bg-white shadow-lg">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error || 'Calculator unavailable'}</p>
        </CardContent>
      </Card>
    );
  }

  // Get options from config
  const termOptions = params.mode === 'lease' 
    ? (config.lease_terms || [36]).map(t => ({ months: t, label: `${t} months` }))
    : (config.finance_terms || [48]).map(t => ({ months: t, label: `${t} months` }));

  const mileageOptions = config.lease_mileages || [10000];
  
  const downPaymentOptions = params.mode === 'lease'
    ? (config.default_lease_down_payments || [2500])
    : (config.default_finance_down_payments || [2500]);

  const creditTiers = config.credit_tiers || [
    { code: 'tier1', label: 'Super Elite 740+' }
  ];

  return (
    <>
    <Card className="border-2 border-gray-200 bg-white shadow-lg">
      <CardContent className="p-4 space-y-4">
        {/* Tab Switches */}
        <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-lg">
          {config.lease_available && (
            <button
              onClick={() => switchMode('lease')}
              className={`py-2 px-3 rounded-md font-bold text-sm transition-all ${
                params.mode === 'lease'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              LEASE
            </button>
          )}
          {config.finance_available && (
            <button
              onClick={() => switchMode('finance')}
              className={`py-2 px-3 rounded-md font-bold text-sm transition-all ${
                params.mode === 'finance'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              FINANCE
            </button>
          )}
        </div>

        {/* Selectors Grid - КОМПАКТНЕЕ */}
        <div className="grid grid-cols-2 gap-3">
          {/* Term Length */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">TERM LENGTH</div>
            <Select value={params.termMonths.toString()} onValueChange={(val) => updateParam('termMonths', parseInt(val))}>
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

          {/* Annual Mileage - Only for lease mode */}
          {params.mode === 'lease' && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">ANNUAL MILEAGE</div>
              <Select value={params.annualMileage.toString()} onValueChange={(val) => updateParam('annualMileage', parseInt(val))}>
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
          )}

          {/* Credit Tier */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">CREDIT TIER</div>
            <Select value={params.creditTier} onValueChange={(val) => updateParam('creditTier', val)}>
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {creditTiers.map(tier => (
                  <SelectItem key={tier.code} value={tier.code}>
                    {tier.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Down Payment */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">DOWN PAYMENT</div>
            <Select value={params.downPayment.toString()} onValueChange={(val) => updateParam('downPayment', parseInt(val))}>
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
        {config.allow_incentives_toggle && (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
            <span className="text-sm font-medium">Apply available incentives</span>
            <button
              onClick={() => updateParam('withIncentives', !params.withIncentives)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                params.withIncentives ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                params.withIncentives ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        )}

        {/* MONTHLY PAYMENT DISPLAY */}
        <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 text-center">
          {calculation?.error ? (
            <div className="py-4 text-red-600 text-sm">{calculation.error}</div>
          ) : calculation ? (
            <>
              <div className="text-xs text-gray-600 mb-1">{calculation.lender || 'Manufacturer Finance'}</div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                ${calculation.monthlyPayment?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mb-2">per month</div>
              <div className="text-xs text-gray-600">
                +${calculation.dueAtSigning?.toLocaleString()} due at signing
              </div>
            </>
          ) : (
            <div className="py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            </div>
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
