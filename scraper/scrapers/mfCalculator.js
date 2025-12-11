/**
 * Money Factor Calculator
 * Reverse calculate MF from payment
 */

class MFCalculator {
  /**
   * Calculate Money Factor from payment
   * Formula: payment = (depreciation + finance_charge) * (1 + tax_rate)
   * Where: depreciation = (selling_price - residual) / term
   *        finance_charge = (selling_price + residual) * MF
   */
  reverseMF(payment, sellingPrice, residual, term, taxRate = 0.0925) {
    // Remove tax
    const basePayment = payment / (1 + taxRate);
    
    // Calculate depreciation
    const depreciation = (sellingPrice - residual) / term;
    
    // finance_charge = basePayment - depreciation
    const financeCharge = basePayment - depreciation;
    
    // MF = finance_charge / (selling_price + residual)
    const mf = financeCharge / (sellingPrice + residual);
    
    return Math.max(0, mf); // Ensure non-negative
  }

  /**
   * Calculate payment from MF (forward calculation)
   */
  calculatePayment(sellingPrice, residual, mf, term, taxRate = 0.0925) {
    const depreciation = (sellingPrice - residual) / term;
    const financeCharge = (sellingPrice + residual) * mf;
    const basePayment = depreciation + financeCharge;
    const paymentWithTax = basePayment * (1 + taxRate);
    
    return Math.round(paymentWithTax * 100) / 100;
  }

  /**
   * Generate MF table for different credit tiers
   * Based on typical spread: each tier adds ~8-15% to MF
   */
  generateMFTable(baseMF) {
    return {
      "740+": Math.round(baseMF * 10000) / 10000,
      "700-739": Math.round(baseMF * 1.08 * 10000) / 10000,
      "675-699": Math.round(baseMF * 1.16 * 10000) / 10000,
      "640-674": Math.round(baseMF * 1.25 * 10000) / 10000,
      "601-639": Math.round(baseMF * 1.40 * 10000) / 10000,
      "0-600": Math.round(baseMF * 1.60 * 10000) / 10000
    };
  }

  /**
   * Generate term table by tier
   * Better credit = more term options
   */
  generateTermTable(baseTerm = 36) {
    return {
      "740+": baseTerm,
      "700-739": baseTerm,
      "675-699": baseTerm,
      "640-674": Math.min(baseTerm + 12, 48),
      "601-639": 48,
      "0-600": 48
    };
  }

  /**
   * Calculate payment table for all tiers
   */
  generatePaymentTable(sellingPrice, residual, baseMF, baseTerm, taxRate = 0.0925) {
    const mfTable = this.generateMFTable(baseMF);
    const termTable = this.generateTermTable(baseTerm);
    const paymentTable = {};
    
    for (const tier in mfTable) {
      const mf = mfTable[tier];
      const term = termTable[tier];
      const payment = this.calculatePayment(sellingPrice, residual, mf, term, taxRate);
      paymentTable[tier] = payment;
    }
    
    return paymentTable;
  }

  /**
   * Enrich offer with calculated data
   */
  enrichOffer(offer) {
    const msrp = offer.msrp || 35000;
    const discount = offer.discount || Math.round(msrp * 0.05); // 5% default
    const sellingPrice = msrp - discount;
    const residualPercent = offer.residualPercent || 60;
    const residual = Math.round(msrp * (residualPercent / 100));
    const term = offer.term || 36;
    const payment = offer.payment || 400;
    
    // Reverse calculate MF from payment
    const calculatedMF = this.reverseMF(payment, sellingPrice, residual, term);
    
    // Generate tables
    const mfTable = this.generateMFTable(calculatedMF);
    const termTable = this.generateTermTable(term);
    const paymentTable = this.generatePaymentTable(sellingPrice, residual, calculatedMF, term);
    
    return {
      ...offer,
      msrp,
      discountAmount: discount,
      sellingPrice,
      residualPercent,
      residualValue: residual,
      mfTable,
      termTable,
      paymentTable,
      taxRate: 0.0925,
      fees: {
        acquisition: 695,
        doc: 85,
        registration: 450,
        otherTaxes: 0,
        taxOnFees: true
      }
    };
  }
}

module.exports = MFCalculator;
