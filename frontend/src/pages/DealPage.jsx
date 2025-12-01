import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function DealPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/deals/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Deal not found');
        return res.json();
      })
      .then(data => {
        setDeal(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading deal:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500">Loading deal...</div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Deal not found</h2>
          <Button onClick={() => navigate('/deals')}>View All Deals</Button>
        </div>
      </div>
    );
  }

  const monthlyPayment = deal.calculated_payment || 0;
  const driveOff = deal.calculated_driveoff || 0;
  const onePay = deal.calculated_onepay || 0;
  const savings = deal.savings_vs_msrp || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Back button */}
        <Link to="/deals" className="inline-block mb-6 text-blue-600 hover:underline">
          ← Back to all deals
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Image & Basic Info */}
          <div>
            {/* Hero Image */}
            <Card className="overflow-hidden mb-6">
              <div className="h-96 bg-gray-200">
                {deal.image_url ? (
                  <img
                    src={deal.image_url}
                    alt={`${deal.year} ${deal.brand} ${deal.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-8xl">🚗</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            {deal.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{deal.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Payment Info & CTA */}
          <div className="space-y-6">
            {/* Title Card */}
            <Card>
              <CardContent className="pt-6">
                <h1 className="text-3xl font-bold mb-2">
                  {deal.year} {deal.brand} {deal.model}
                </h1>
                {deal.trim && (
                  <p className="text-xl text-gray-600 mb-2">{deal.trim}</p>
                )}
                {deal.bank && (
                  <p className="text-sm text-blue-600 font-medium mb-4">{deal.bank}</p>
                )}
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>{deal.term_months} months</span>
                  <span>•</span>
                  <span>{(deal.annual_mileage / 1000).toFixed(1)}k mi/yr</span>
                  <span>•</span>
                  <span>{deal.region}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-2xl">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Monthly Payment */}
                  <div className="bg-white rounded-lg p-6 text-center">
                    <div className="text-5xl font-bold text-red-600">
                      ${monthlyPayment.toFixed(0)}
                    </div>
                    <div className="text-gray-600 mt-2">per month (incl. tax)</div>
                  </div>

                  {/* Other Payments */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-sm text-gray-600">Drive-Off</div>
                      <div className="text-2xl font-bold">
                        ${driveOff.toFixed(0)}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4">
                      <div className="text-sm text-gray-600">One-Pay</div>
                      <div className="text-2xl font-bold">
                        ${onePay.toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program Details */}
            {deal.mf_used && (
              <Card>
                <CardHeader>
                  <CardTitle>Program Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">MSRP:</span>
                    <span className="font-semibold">${deal.msrp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selling Price:</span>
                    <span className="font-semibold text-green-600">
                      ${deal.selling_price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Money Factor:</span>
                    <span className="font-semibold">{deal.mf_used.toFixed(5)}</span>
                  </div>
                  {deal.residual_percent_used && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Residual:</span>
                      <span className="font-semibold">
                        {deal.residual_percent_used.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {savings > 0 && (
                    <div className="flex justify-between pt-3 border-t">
                      <span className="text-gray-600">Total Savings:</span>
                      <span className="font-semibold text-green-600">
                        ${savings.toFixed(0)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* CTA Buttons */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <CardContent className="pt-6 space-y-4">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                  onClick={() => {
                    const message = `Hi, I want this deal: ${deal.year} ${deal.brand} ${deal.model} ${deal.trim || ''}, ${deal.term_months}mo, $${monthlyPayment.toFixed(0)}/mo`;
                    window.open(`https://t.me/SalesAzatAuto?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                >
                  💬 Get this deal via Telegram
                </Button>

                <Link
                  to={`/calculator?brand=${deal.brand}&model=${deal.model}`}
                  className="block"
                >
                  <Button className="w-full" variant="outline">
                    🧮 Calculate custom configuration
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Stock info */}
            {deal.stock_count && deal.stock_count > 0 && (
              <div className="text-center text-sm text-gray-600">
                <span className="font-semibold">{deal.stock_count} units</span> in stock
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
