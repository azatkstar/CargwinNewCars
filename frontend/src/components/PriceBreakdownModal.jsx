import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Info, DollarSign, FileText, Shield } from 'lucide-react';

const PriceBreakdownModal = ({ isOpen, onClose, car, state = 'CA' }) => {
  const [taxData, setTaxData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTaxData();
    }
  }, [isOpen, state]);

  const fetchTaxData = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/tax-fees/${state}`);
      const data = await response.json();
      setTaxData(data);
    } catch (error) {
      console.error('Failed to fetch tax data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fleetPrice = car?.fleet || 0;
  const msrp = car?.msrp || 0;
  const savings = car?.savings || 0;
  const salesTaxRate = taxData?.sales_tax_rate || 7.25;
  
  // Lease calculations
  const monthlyPayment = car?.lease?.monthly || 0;
  const dueAtSigning = car?.lease?.dueAtSigning || 3000;
  const termMonths = car?.lease?.termMonths || 36;
  const milesPerYear = car?.lease?.milesPerYear || 7500;
  
  // Calculate Money Factor from APR (if finance APR exists)
  const apr = car?.finance?.apr || 9.75;
  const moneyFactor = (apr / 2400).toFixed(5);
  
  // Fee calculations
  const downPaymentTax = Math.round(dueAtSigning * (salesTaxRate / 100));
  const acquisitionFee = 595;
  const registrationFee = taxData?.dmv_registration || 580;
  const docFee = taxData?.doc_fee || 85;
  const otherTax = Math.round((acquisitionFee + registrationFee) * (salesTaxRate / 100));
  const taxOnFees = Math.round(docFee * (salesTaxRate / 100));
  
  // Calculate residual value (typically 50-60% of MSRP for 36mo lease)
  const residualPercent = 55; // Standard for 36 months
  const residualValue = Math.round(msrp * (residualPercent / 100));
  
  // Rebates
  const totalRebates = savings;
  const rebates = [
    { name: `${car?.title} Fleet Discount`, amount: Math.round(savings * 0.7) },
    { name: 'Manufacturer Lease Cash', amount: Math.round(savings * 0.3) }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-6 h-6 text-green-600" />
            Price Transparency by CargwinNewCar
          </DialogTitle>
          <DialogDescription className="text-base">
            No hidden fees. See every cost up front — taxes, fees, and incentives included. 
            Shop with confidence knowing exactly what you'll pay.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <Tabs defaultValue="lease" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lease">Lease Breakdown</TabsTrigger>
              <TabsTrigger value="finance">Finance Breakdown</TabsTrigger>
            </TabsList>

            {/* LEASE TAB */}
            <TabsContent value="lease" className="space-y-6 mt-4">
              {/* Your Lease (including taxes and fees) */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-bold text-lg text-blue-900 mb-4">
                  Your lease (including taxes and fees)
                </h3>
                
                {/* Monthly Payment */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-semibold">Monthly payment</span>
                    <span className="text-3xl font-bold text-blue-900">${monthlyPayment} per month</span>
                  </div>
                </div>

                {/* Due at Signing Breakdown */}
                <div className="bg-white rounded p-4 space-y-2">
                  <div className="flex justify-between font-semibold border-b pb-2">
                    <span>Due at signing</span>
                    <span className="text-xl">${dueAtSigning.toLocaleString()}</span>
                  </div>
                  
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">First Monthly Payment</span>
                      <span className="font-medium">${monthlyPayment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Down Pmt. Tax {salesTaxRate}%</span>
                      <span className="font-medium">${downPaymentTax}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Acquisition Fee</span>
                      <span className="font-medium">${acquisitionFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registration Fee</span>
                      <span className="font-medium">${registrationFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Other Tax {salesTaxRate}%</span>
                      <span className="font-medium">${otherTax}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doc Fee</span>
                      <span className="font-medium">${docFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax On Fees</span>
                      <span className="font-medium">${taxOnFees}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rebates and Incentives */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-bold text-lg text-green-900 mb-3">
                  Potential rebates and incentives
                </h3>
                <div className="bg-white rounded p-4 space-y-2">
                  <div className="flex justify-between font-semibold border-b pb-2">
                    <span>Total rebates</span>
                    <span className="text-xl text-green-700">${totalRebates.toLocaleString()}</span>
                  </div>
                  {rebates.map((rebate, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{rebate.name}</span>
                      <span className="font-medium">${rebate.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 mt-2">
                    * Subject to qualification. Rebates applied to reduce fleet price.
                  </p>
                </div>
              </div>

              {/* Lease Conditions */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-bold text-lg text-gray-900 mb-3">
                  Lease conditions
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">Term length</div>
                    <div className="font-semibold text-lg">{termMonths} months</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Annual mileage</div>
                    <div className="font-semibold text-lg">{milesPerYear.toLocaleString()} miles</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Due At Signing Type</div>
                    <div className="font-medium">First payment + All fees</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Residual value</div>
                    <div className="font-semibold text-lg">${residualValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Money factor</div>
                    <div className="font-semibold">{moneyFactor}</div>
                    <div className="text-xs text-gray-500">≈ {apr}% APR</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Lender Name</div>
                    <div className="font-medium">
                      {car?.make === 'Lexus' ? 'Lexus Financial Services' : 'Partner Lender'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Cost Summary */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg">Total lease cost ({termMonths} months)</span>
                  <span className="text-3xl font-bold">
                    ${((monthlyPayment * termMonths) + dueAtSigning).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-blue-100">
                  ${monthlyPayment}/mo × {termMonths} + ${dueAtSigning.toLocaleString()} due at signing
                </div>
              </div>
            </TabsContent>

            {/* FINANCE TAB */}
            <TabsContent value="finance" className="space-y-6 mt-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-bold text-lg text-green-900 mb-4">
                  Your finance (including taxes and fees)
                </h3>
                
                {/* Calculate finance monthly payment */}
                {(() => {
                  const financeAPR = car?.finance?.apr || 9.75;
                  const financeTerm = car?.finance?.termMonths || 60;
                  const downPayment = car?.finance?.downPayment || 3000;
                  const principal = fleetPrice - downPayment;
                  const monthlyRate = financeAPR / 100 / 12;
                  const financeMonthly = Math.round(
                    (principal * monthlyRate * Math.pow(1 + monthlyRate, financeTerm)) /
                    (Math.pow(1 + monthlyRate, financeTerm) - 1)
                  );
                  
                  const salesTax = Math.round(fleetPrice * (salesTaxRate / 100));
                  const totalDueAtSigning = downPayment + registrationFee + docFee + taxOnFees;

                  return (
                    <>
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-700 font-semibold">Monthly payment</span>
                          <span className="text-3xl font-bold text-green-900">${financeMonthly} per month</span>
                        </div>
                      </div>

                      <div className="bg-white rounded p-4 space-y-2">
                        <div className="flex justify-between font-semibold border-b pb-2">
                          <span>Due at signing</span>
                          <span className="text-xl">${totalDueAtSigning.toLocaleString()}</span>
                        </div>
                        
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Down Payment</span>
                            <span className="font-medium">${downPayment.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Registration Fee</span>
                            <span className="font-medium">${registrationFee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Doc Fee</span>
                            <span className="font-medium">${docFee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax On Fees</span>
                            <span className="font-medium">${taxOnFees}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded p-4 mt-4">
                        <h4 className="font-semibold mb-3">Finance Conditions</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600 mb-1">APR</div>
                            <div className="font-semibold text-lg">{financeAPR}%</div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">Term length</div>
                            <div className="font-semibold text-lg">{financeTerm} months</div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">Down Payment</div>
                            <div className="font-semibold">${downPayment.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">Sales Tax</div>
                            <div className="font-semibold">${salesTax.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">({salesTaxRate}% of price)</div>
                          </div>
                        </div>
                      </div>

                      {/* Total Cost */}
                      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg">Total finance cost ({financeTerm} months)</span>
                          <span className="text-3xl font-bold">
                            ${((financeMonthly * financeTerm) + totalDueAtSigning + salesTax).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-green-100">
                          ${financeMonthly}/mo × {financeTerm} + ${totalDueAtSigning.toLocaleString()} due + ${salesTax.toLocaleString()} sales tax
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Disclaimer */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-yellow-700 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-900">
              <p className="font-semibold mb-1">Important Notes:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>All payments are approximate and depend on credit history, down payment, loan term and other factors.</li>
                <li>Final terms are determined by the dealer and lender after credit approval.</li>
                <li>Taxes and fees vary by location and may be subject to change.</li>
                <li>Rebates subject to qualification - proof required.</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full mt-4"
          variant="outline"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PriceBreakdownModal;
