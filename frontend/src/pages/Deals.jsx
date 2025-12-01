import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/deals/list?limit=50&sort=calculated_payment`)
      .then(res => res.json())
      .then(data => {
        setDeals(data.deals || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading deals:', err);
        setLoading(false);
      });
  }, []);

  // Client-side filtering
  const filteredDeals = deals.filter(deal => {
    if (activeFilter === 'all') return true;
    
    if (activeFilter === 'low-payment') {
      return (deal.calculated_payment || 0) < 350;
    }
    
    if (activeFilter === 'zero-down') {
      return (deal.calculated_driveoff || 0) === 0 || (deal.calculated_driveoff || 0) < 100;
    }
    
    if (activeFilter === 'luxury') {
      const luxuryBrands = ['BMW', 'Mercedes', 'Mercedes-Benz', 'Audi', 'Lexus'];
      return luxuryBrands.includes(deal.brand);
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500">Loading deals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">Featured Fleet Deals</h1>
          <p className="text-gray-600 text-lg">
            Best lease offers with real bank programs and transparent pricing
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeFilter === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Deals
          </button>
          <button
            onClick={() => setActiveFilter('low-payment')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeFilter === 'low-payment'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            💰 Low Payment
          </button>
          <button
            onClick={() => setActiveFilter('zero-down')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeFilter === 'zero-down'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🎯 Zero Down
          </button>
          <button
            onClick={() => setActiveFilter('luxury')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeFilter === 'luxury'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ✨ Luxury
          </button>
        </div>

        {/* Deals Grid */}
        {filteredDeals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No deals available right now. Check back soon!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map(deal => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DealCard({ deal }) {
  const monthlyPayment = deal.calculated_payment || 0;
  const driveOff = deal.calculated_driveoff || 0;
  const savings = deal.savings_vs_msrp || 0;
  const bankName = deal.bank || null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="h-48 bg-gray-200 overflow-hidden">
        {deal.image_url ? (
          <img
            src={deal.image_url}
            alt={`${deal.year} ${deal.brand} ${deal.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-6xl">🚗</span>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold mb-2">
          {deal.year} {deal.brand} {deal.model}
        </h3>
        {deal.trim && (
          <p className="text-sm text-gray-600 mb-2">{deal.trim}</p>
        )}
        {bankName && (
          <p className="text-xs text-blue-600 mb-4 font-medium">{bankName}</p>
        )}

        {/* Price */}
        <div className="mb-4">
          <div className="text-3xl font-bold text-red-600">
            ${monthlyPayment.toFixed(0)}
            <span className="text-lg text-gray-600">/mo</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {deal.term_months} months • {(deal.annual_mileage / 1000).toFixed(1)}k mi/yr
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Drive-off:</span>
            <span className="font-semibold">${driveOff.toFixed(0)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Savings:</span>
              <span className="font-semibold text-green-600">${savings.toFixed(0)}</span>
            </div>
          )}
          {deal.stock_count && deal.stock_count > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">In Stock:</span>
              <span className="font-semibold">{deal.stock_count} units</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Link to={`/deal/${deal.id}`}>
          <Button className="w-full bg-red-600 hover:bg-red-700">
            View Deal →
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
