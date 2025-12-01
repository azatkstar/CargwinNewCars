import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function Compare() {
  const [searchParams] = useSearchParams();
  const [comparison, setComparison] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = searchParams.get('ids');
    if (ids) {
      const dealIds = ids.split(',');
      loadComparison(dealIds);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const loadComparison = async (dealIds) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_ids: dealIds })
      });

      const data = await response.json();
      setComparison(data.comparison);
      setSummary(data.summary);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading comparison...</div>
        </div>
      </div>
    );
  }

  if (!comparison || !comparison.deals || comparison.deals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">No deals to compare</h2>
          <Link to="/deals">
            <Button>Browse Deals</Button>
          </Link>
        </div>
      </div>
    );
  }

  const deals = comparison.deals;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <Link to="/deals" className="inline-block mb-6 text-blue-600 hover:underline">
          ← Back to deals
        </Link>

        <h1 className="text-3xl font-bold mb-6">Compare Deals</h1>

        {/* Summary */}
        {summary && (
          <Card className="mb-6 bg-blue-50">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Avg Payment</div>
                  <div className="text-2xl font-bold">${summary.avg_payment?.toFixed(0)}/mo</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Payment Spread</div>
                  <div className="text-2xl font-bold">${summary.payment_spread?.toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Best Deal</div>
                  <div className="text-2xl font-bold">
                    {deals[summary.best_deal_index]?.brand} {deals[summary.best_deal_index]?.model}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparison Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Feature</th>
                    {deals.map((deal, idx) => (
                      <th key={idx} className="px-4 py-3 text-center">
                        <div className="space-y-2">
                          <img
                            src={deal.image_url || 'https://via.placeholder.com/150'}
                            alt={`${deal.brand} ${deal.model}`}
                            className="w-24 h-24 mx-auto object-cover rounded"
                          />
                          <div className="font-bold">{deal.year} {deal.brand}</div>
                          <div className="text-sm">{deal.model} {deal.trim}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <ComparisonRow
                    label="Monthly Payment"
                    values={deals.map(d => `$${d.monthly_payment?.toFixed(0)}/mo`)}
                    bestIndices={deals.map((d, i) => d.best_payment ? i : -1).filter(i => i >= 0)}
                  />
                  <ComparisonRow
                    label="Drive-Off"
                    values={deals.map(d => `$${d.driveoff?.toFixed(0)}`)}
                    bestIndices={deals.map((d, i) => d.best_driveoff ? i : -1).filter(i => i >= 0)}
                  />
                  <ComparisonRow
                    label="One-Pay"
                    values={deals.map(d => `$${d.onepay?.toFixed(0)}`)}
                  />
                  <ComparisonRow
                    label="Term"
                    values={deals.map(d => `${d.term_months} months`)}
                  />
                  <ComparisonRow
                    label="Mileage"
                    values={deals.map(d => `${(d.annual_mileage / 1000).toFixed(1)}k mi/yr`)}
                  />
                  <ComparisonRow
                    label="MSRP"
                    values={deals.map(d => `$${d.msrp?.toLocaleString()}`)}
                  />
                  <ComparisonRow
                    label="Selling Price"
                    values={deals.map(d => `$${d.selling_price?.toLocaleString()}`)}
                  />
                  <ComparisonRow
                    label="Money Factor"
                    values={deals.map(d => d.mf?.toFixed(5) || 'N/A')}
                    bestIndices={deals.map((d, i) => d.best_mf ? i : -1).filter(i => i >= 0)}
                  />
                  <ComparisonRow
                    label="Residual"
                    values={deals.map(d => `${d.residual?.toFixed(1)}%` || 'N/A')}
                  />
                  <ComparisonRow
                    label="Bank"
                    values={deals.map(d => d.bank || 'N/A')}
                  />
                  <ComparisonRow
                    label="Savings vs MSRP"
                    values={deals.map(d => `$${d.savings?.toFixed(0)}`)}
                    bestIndices={deals.map((d, i) => d.best_savings ? i : -1).filter(i => i >= 0)}
                  />
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {deals.map((deal, idx) => (
            <Link key={idx} to={`/deal/${deal.id}`}>
              <Button className="w-full">
                View {deal.brand} {deal.model}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({ label, values, bestIndices = [] }) {
  return (
    <tr>
      <td className="px-4 py-3 font-medium text-gray-700">{label}</td>
      {values.map((value, idx) => (
        <td
          key={idx}
          className={`px-4 py-3 text-center ${
            bestIndices.includes(idx)
              ? 'bg-green-50 font-bold text-green-700 border-2 border-green-200'
              : ''
          }`}
        >
          {value}
        </td>
      ))}
    </tr>
  );
}
