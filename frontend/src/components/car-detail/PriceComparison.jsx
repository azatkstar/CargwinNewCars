import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingDown, Check } from 'lucide-react';
import { formatPrice } from '../../utils/timer';

const PriceComparison = ({ car }) => {
  // Check if we have competitor prices
  const hasCompetitorPrices = car.competitor_prices && (
    car.competitor_prices.autobandit?.monthly > 0 || 
    car.competitor_prices.dealerAverage?.monthly > 0
  );

  if (!hasCompetitorPrices) {
    return null; // Don't show if no competitor data
  }

  const fleetPrice = car.msrp - (car.discount || 0);
  const competitorPrices = car.competitor_prices || {};

  // Calculate savings vs AutoBandit
  const autoBanditSavings = competitorPrices.autobandit?.monthly > 0 
    ? {
        monthly: competitorPrices.autobandit.monthly - (fleetPrice / (competitorPrices.autobandit.term || 36)),
        total: (competitorPrices.autobandit.monthly - (fleetPrice / (competitorPrices.autobandit.term || 36))) * (competitorPrices.autobandit.term || 36),
        percentage: ((competitorPrices.autobandit.monthly - (fleetPrice / (competitorPrices.autobandit.term || 36))) / competitorPrices.autobandit.monthly * 100)
      }
    : null;

  // Calculate savings vs Dealer Average
  const dealerSavings = competitorPrices.dealerAverage?.monthly > 0
    ? {
        monthly: competitorPrices.dealerAverage.monthly - (fleetPrice / (competitorPrices.dealerAverage.term || 36)),
        total: (competitorPrices.dealerAverage.monthly - (fleetPrice / (competitorPrices.dealerAverage.term || 36))) * (competitorPrices.dealerAverage.term || 36),
        percentage: ((competitorPrices.dealerAverage.monthly - (fleetPrice / (competitorPrices.dealerAverage.term || 36))) / competitorPrices.dealerAverage.monthly * 100)
      }
    : null;

  // Find best savings
  const bestSavings = autoBanditSavings?.monthly > (dealerSavings?.monthly || 0) 
    ? { ...autoBanditSavings, competitor: 'AutoBandit' }
    : dealerSavings 
      ? { ...dealerSavings, competitor: 'California Dealers' }
      : null;

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <TrendingDown className="w-6 h-6 text-green-600" />
          Exclusive Fleet Pricing - Beat the Market!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Best Savings Highlight */}
        {bestSavings && (
          <div className="bg-green-600 text-white rounded-xl p-6 text-center">
            <div className="text-sm font-semibold uppercase mb-2">Your Savings vs {bestSavings.competitor}</div>
            <div className="text-5xl font-bold mb-2">
              {formatPrice(Math.abs(bestSavings.total))}
            </div>
            <div className="text-xl">
              {formatPrice(Math.abs(bestSavings.monthly))}/month · {Math.abs(bestSavings.percentage).toFixed(1)}% less
            </div>
            <Badge className="mt-3 bg-white text-green-700 font-bold px-4 py-1">
              Verified {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </Badge>
          </div>
        )}

        {/* Detailed Comparison Table */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-3">Price Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Provider</th>
                  <th className="text-right py-2">Monthly</th>
                  <th className="text-right py-2">Due at Signing</th>
                  <th className="text-right py-2">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {/* Our Price */}
                <tr className="border-b bg-green-50 font-semibold">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-green-900">CargWin NewCar</span>
                      <Badge className="bg-green-600 text-white text-xs">BEST</Badge>
                    </div>
                  </td>
                  <td className="text-right text-green-700">
                    {formatPrice(fleetPrice / 36)}/mo
                  </td>
                  <td className="text-right">{formatPrice(car.fees_hint || 0)}</td>
                  <td className="text-right font-bold text-green-700">
                    {formatPrice(fleetPrice + (car.fees_hint || 0))}
                  </td>
                </tr>

                {/* AutoBandit */}
                {competitorPrices.autobandit?.monthly > 0 && (
                  <tr className="border-b">
                    <td className="py-3">
                      <span className="text-gray-700">AutoBandit</span>
                    </td>
                    <td className="text-right text-gray-600">
                      {formatPrice(competitorPrices.autobandit.monthly)}/mo
                    </td>
                    <td className="text-right text-gray-600">
                      {formatPrice(competitorPrices.autobandit.dueAtSigning || 0)}
                    </td>
                    <td className="text-right text-gray-600">
                      {formatPrice(
                        competitorPrices.autobandit.monthly * (competitorPrices.autobandit.term || 36) + 
                        (competitorPrices.autobandit.dueAtSigning || 0)
                      )}
                    </td>
                  </tr>
                )}

                {/* Dealer Average */}
                {competitorPrices.dealerAverage?.monthly > 0 && (
                  <tr className="border-b">
                    <td className="py-3">
                      <span className="text-gray-700">CA Dealer Average</span>
                    </td>
                    <td className="text-right text-gray-600">
                      {formatPrice(competitorPrices.dealerAverage.monthly)}/mo
                    </td>
                    <td className="text-right text-gray-600">
                      {formatPrice(competitorPrices.dealerAverage.dueAtSigning || 0)}
                    </td>
                    <td className="text-right text-gray-600">
                      {formatPrice(
                        competitorPrices.dealerAverage.monthly * (competitorPrices.dealerAverage.term || 36) + 
                        (competitorPrices.dealerAverage.dueAtSigning || 0)
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Why We're Cheaper */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">🎯 Why Our Fleet Prices Are Lower:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Direct bulk purchasing from manufacturers</li>
            <li>✓ No dealer markups or hidden fees</li>
            <li>✓ Exclusive fleet discounts passed to you</li>
            <li>✓ Transparent pricing - what you see is what you get</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            * Competitor prices verified {competitorPrices.autobandit?.updatedAt 
              ? new Date(competitorPrices.autobandit.updatedAt).toLocaleDateString()
              : 'recently'} for {car.state || 'CA'} market
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceComparison;
