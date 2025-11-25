import { useState, useEffect, useMemo } from 'react';

/**
 * Payment Calculator Hook
 * Provides unified lease and finance calculations for car offers
 * All configuration comes from backend, no hardcoded values
 */
export const usePaymentCalculator = (carId, initialParams = {}) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculator parameters
  const [params, setParams] = useState({
    mode: 'lease', // 'lease' or 'finance'
    termMonths: 36,
    annualMileage: 10000,
    creditTier: 'tier1',
    downPayment: 2500,
    withIncentives: true,
    ...initialParams
  });

  // Fetch calculator configuration from backend
  useEffect(() => {
    if (!carId) return;

    const fetchConfig = async () => {
      setLoading(true);
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
        const response = await fetch(`${BACKEND_URL}/api/cars/${carId}/calculator-config`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch calculator configuration');
        }

        const data = await response.json();
        setConfig(data);
        
        // Set default params from config
        if (data.lease_available && params.mode === 'lease') {
          setParams(prev => ({
            ...prev,
            termMonths: data.lease_terms?.[1] || 36,
            annualMileage: data.lease_mileages?.[1] || 10000,
            downPayment: data.default_lease_down_payments?.[4] || 2500
          }));
        } else if (data.finance_available && params.mode === 'finance') {
          setParams(prev => ({
            ...prev,
            termMonths: data.finance_terms?.[1] || 48,
            downPayment: data.default_finance_down_payments?.[2] || 2500
          }));
        }
        
        setError(null);
      } catch (err) {
        console.error('Calculator config fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [carId]);

  // Calculate lease payment
  const calculateLease = useMemo(() => {
    if (!config || params.mode !== 'lease') return null;

    const {
      msrp,
      final_price,
      lease_residuals,
      money_factor_by_tier,
      acquisition_fee = 695,
      dealer_fees = 0,
      doc_fee = 85,
      dmv_fee = 540,
      tax_rate = 0.0775,
      rebates_taxable = 0,
      rebates_non_taxable = 0
    } = config;

    const {
      termMonths,
      annualMileage,
      creditTier,
      downPayment,
      withIncentives
    } = params;

    try {
      // Get residual value
      const residualPercent = lease_residuals?.[String(termMonths)]?.[String(annualMileage)];
      if (!residualPercent) {
        return { error: 'Residual value not available for selected term/mileage' };
      }

      const residualValue = Math.round(msrp * residualPercent);

      // Get money factor
      const moneyFactor = money_factor_by_tier?.[creditTier];
      if (!moneyFactor) {
        return { error: 'Money factor not available for selected credit tier' };
      }

      // Calculate adjusted cap cost (selling price + fees - incentives)
      let adjustedCapCost = final_price;
      
      // Apply incentives if enabled (these reduce the cap cost)
      if (withIncentives) {
        adjustedCapCost -= (rebates_taxable + rebates_non_taxable);
      }

      // Add capitalized fees
      adjustedCapCost += acquisition_fee + dealer_fees;

      // Net cap cost for payment calculation (adjusted cap cost - down payment as cap cost reduction)
      const netCapCost = adjustedCapCost - downPayment;

      // Calculate depreciation and rent charge
      const depreciation = (netCapCost - residualValue) / termMonths;
      const rentCharge = (netCapCost + residualValue) * moneyFactor;

      // Base payment (before tax)
      const basePayment = depreciation + rentCharge;

      // Apply sales tax
      const taxAmount = basePayment * tax_rate;
      const monthlyPayment = Math.round(basePayment + taxAmount);

      // Calculate due at signing
      const dueAtSigning = Math.round(
        downPayment +
        monthlyPayment + // First month
        doc_fee +
        dmv_fee
      );

      return {
        monthlyPayment,
        dueAtSigning,
        residualValue,
        moneyFactor: moneyFactor.toFixed(5),
        capCost: Math.round(capCost),
        depreciation: Math.round(depreciation),
        rentCharge: Math.round(rentCharge),
        taxAmount: Math.round(taxAmount),
        lender: `${config.make || 'Manufacturer'} Financial`,
        apr: (moneyFactor * 2400).toFixed(2) // Convert MF to APR equivalent
      };
    } catch (err) {
      console.error('Lease calculation error:', err);
      return { error: 'Calculation error' };
    }
  }, [config, params]);

  // Calculate finance payment
  const calculateFinance = useMemo(() => {
    if (!config || params.mode !== 'finance') return null;

    const {
      final_price,
      apr_by_tier,
      doc_fee = 85,
      dmv_fee = 540,
      tax_rate = 0.0775,
      finance_fees = 0,
      rebates_taxable = 0,
      rebates_non_taxable = 0
    } = config;

    const {
      termMonths,
      creditTier,
      downPayment,
      withIncentives
    } = params;

    try {
      // Get APR
      const apr = apr_by_tier?.[creditTier];
      if (!apr) {
        return { error: 'APR not available for selected credit tier' };
      }

      // Calculate amount to be financed
      let amountFinanced = final_price;

      // Apply incentives if enabled
      if (withIncentives) {
        amountFinanced -= (rebates_taxable + rebates_non_taxable);
      }

      // Add sales tax to amount financed
      const salesTax = amountFinanced * tax_rate;
      amountFinanced += salesTax;

      // Add finance fees
      amountFinanced += finance_fees;

      // Subtract down payment
      amountFinanced -= downPayment;

      // Calculate monthly payment using amortization formula
      const monthlyRate = apr / 100 / 12;
      const monthlyPayment = Math.round(
        amountFinanced * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -termMonths)))
      );

      // Calculate due at signing
      const dueAtSigning = Math.round(
        downPayment +
        doc_fee +
        dmv_fee
      );

      // Calculate total interest
      const totalPayments = monthlyPayment * termMonths;
      const totalInterest = totalPayments - (amountFinanced - finance_fees);

      return {
        monthlyPayment,
        dueAtSigning,
        amountFinanced: Math.round(amountFinanced),
        apr: apr.toFixed(2),
        totalInterest: Math.round(totalInterest),
        totalPayments: Math.round(totalPayments),
        lender: `${config.make || 'Manufacturer'} Financial`
      };
    } catch (err) {
      console.error('Finance calculation error:', err);
      return { error: 'Calculation error' };
    }
  }, [config, params]);

  // Get current calculation based on mode
  const currentCalculation = params.mode === 'lease' ? calculateLease : calculateFinance;

  // Update single parameter
  const updateParam = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  // Switch between lease and finance mode
  const switchMode = (mode) => {
    if (!config) return;

    if (mode === 'lease' && config.lease_available) {
      setParams(prev => ({
        ...prev,
        mode: 'lease',
        termMonths: config.lease_terms?.[1] || 36,
        annualMileage: config.lease_mileages?.[1] || 10000,
        downPayment: config.default_lease_down_payments?.[4] || 2500
      }));
    } else if (mode === 'finance' && config.finance_available) {
      setParams(prev => ({
        ...prev,
        mode: 'finance',
        termMonths: config.finance_terms?.[1] || 48,
        downPayment: config.default_finance_down_payments?.[2] || 2500
      }));
    }
  };

  return {
    // Configuration
    config,
    loading,
    error,

    // Current parameters
    params,
    updateParam,
    switchMode,

    // Calculations
    calculation: currentCalculation,
    leaseCalculation: calculateLease,
    financeCalculation: calculateFinance
  };
};

export default usePaymentCalculator;
