import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TrendingDown, TrendingUp, DollarSign } from 'lucide-react';

const LeaseVsFinanceComparison = ({ car }) => {
  if (!car) return null;

  const fleetPrice = car.fleet || 50000;
  const msrp = car.msrp || 60000;
  
  // Lease calculations
  const leaseMonthly = car.lease?.monthly || 500;
  const leaseTerm = car.lease?.termMonths || 36;
  const leaseDueAtSigning = car.lease?.dueAtSigning || 3000;
  const leaseTotalCost = (leaseMonthly * leaseTerm) + leaseDueAtSigning;
  
  // Finance calculations
  const financeAPR = car.finance?.apr || 9.75;
  const financeTerm = car.finance?.termMonths || 60;
  const downPayment = car.finance?.downPayment || 3000;
  const principal = fleetPrice - downPayment;
  const monthlyRate = financeAPR / 100 / 12;
  const financeMonthly = Math.round(
    (principal * monthlyRate * Math.pow(1 + monthlyRate, financeTerm)) /
    (Math.pow(1 + monthlyRate, financeTerm) - 1)
  );
  const financeTotalCost = (financeMonthly * financeTerm) + downPayment;
  const financeInterest = financeTotalCost - fleetPrice;
  
  // Cash calculations
  const salesTax = Math.round(fleetPrice * 0.0875); // CA 8.75%
  const fees = 580 + 85; // Registration + Doc
  const cashTotalCost = fleetPrice + salesTax + fees;

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle>Lease vs Finance vs Cash Comparison</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Compare all payment options side-by-side
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="total-cost">Total Cost</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Lease */}
              <div className="bg-green-50 p-4 rounded border-2 border-green-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Lease</p>
                  <p className="text-3xl font-bold text-green-700">${leaseMonthly}</p>
                  <p className="text-xs text-gray-600">/month</p>
                  <div className="mt-3 text-xs text-gray-600">
                    <p>{leaseTerm} months</p>
                    <p>${leaseDueAtSigning.toLocaleString()} due at signing</p>
                  </div>
                </div>
              </div>

              {/* Finance */}
              <div className="bg-blue-50 p-4 rounded border-2 border-blue-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Finance</p>
                  <p className="text-3xl font-bold text-blue-700">${financeMonthly}</p>
                  <p className="text-xs text-gray-600">/month</p>
                  <div className="mt-3 text-xs text-gray-600">
                    <p>{financeTerm} months</p>
                    <p>${downPayment.toLocaleString()} down payment</p>
                  </div>
                </div>
              </div>

              {/* Cash */}
              <div className="bg-purple-50 p-4 rounded border-2 border-purple-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Cash</p>
                  <p className="text-2xl font-bold text-purple-700">${(cashTotalCost / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-600">one-time</p>
                  <div className="mt-3 text-xs text-gray-600">
                    <p>Own immediately</p>
                    <p>No interest</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left font-medium text-gray-900">Feature</th>
                    <th className="p-3 text-center font-medium text-gray-900">Lease</th>
                    <th className="p-3 text-center font-medium text-gray-900">Finance</th>
                    <th className="p-3 text-center font-medium text-gray-900">Cash</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3 font-medium">Monthly Payment</td>
                    <td className="p-3 text-center">${leaseMonthly}</td>
                    <td className="p-3 text-center">${financeMonthly}</td>
                    <td className="p-3 text-center">$0</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Upfront Cost</td>
                    <td className="p-3 text-center">${leaseDueAtSigning.toLocaleString()}</td>
                    <td className="p-3 text-center">${downPayment.toLocaleString()}</td>
                    <td className="p-3 text-center">${cashTotalCost.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Ownership</td>
                    <td className="p-3 text-center">❌ Return at end</td>
                    <td className="p-3 text-center">✅ Own after {financeTerm}mo</td>
                    <td className="p-3 text-center">✅ Own immediately</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Mileage Limit</td>
                    <td className="p-3 text-center">7,500/year</td>
                    <td className="p-3 text-center">Unlimited</td>
                    <td className="p-3 text-center">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Early Exit</td>
                    <td className="p-3 text-center">Penalties apply</td>
                    <td className="p-3 text-center">Can sell anytime</td>
                    <td className="p-3 text-center">N/A</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="total-cost" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded">
                <p className="text-sm text-gray-600 mb-2">Lease Total</p>
                <p className="text-2xl font-bold text-green-700">
                  ${leaseTotalCost.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Over {leaseTerm} months
                </p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded">
                <p className="text-sm text-gray-600 mb-2">Finance Total</p>
                <p className="text-2xl font-bold text-blue-700">
                  ${financeTotalCost.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  ${financeInterest.toLocaleString()} interest
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded">
                <p className="text-sm text-gray-600 mb-2">Cash Total</p>
                <p className="text-2xl font-bold text-purple-700">
                  ${cashTotalCost.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Best if keeping 5+ years
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <p className="text-sm font-medium text-yellow-900 mb-2">💡 Recommendation:</p>
              <p className="text-sm text-gray-700">
                {leaseTotalCost < financeTotalCost * 0.7 
                  ? "Lease is the most cost-effective option for 3 years"
                  : financeTotalCost < cashTotalCost * 1.1
                  ? "Finance offers good value if keeping the car long-term"
                  : "Cash purchase best if you have funds available"}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LeaseVsFinanceComparison;
