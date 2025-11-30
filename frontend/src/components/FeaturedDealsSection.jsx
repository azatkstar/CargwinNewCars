import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowRight } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function FeaturedDealsSection() {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/deals/list?limit=3&sort=calculated_payment`)
      .then(res => res.json())
      .then(data => setDeals(data.deals || []))
      .catch(err => console.error('Error loading deals:', err));
  }, []);

  if (deals.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            🔥 HOT DEALS
          </div>
          <h2 className="text-4xl font-bold mb-3">Featured Deals This Week</h2>
          <p className="text-gray-600 text-lg">
            Best lease offers with automatic bank program pricing
          </p>
        </div>

        {/* Deals Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link to="/deals">
            <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg">
              View All Deals <ArrowRight className="w-5 h-5 inline ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function DealCard({ deal }) {
  const monthlyPayment = deal.calculated_payment || 0;
  const driveOff = deal.calculated_driveoff || 0;
  const savings = deal.savings_vs_msrp || 0;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="h-48 bg-gray-200 overflow-hidden">
        {deal.image_url ? (
          <img
            src={deal.image_url}
            alt={`${deal.year} ${deal.brand} ${deal.model}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-6xl">🚗</span>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2">
          {deal.year} {deal.brand} {deal.model}
        </h3>
        {deal.trim && (
          <p className="text-sm text-gray-600 mb-4">{deal.trim}</p>
        )}

        <div className="mb-4">
          <div className="text-3xl font-bold text-red-600">
            ${monthlyPayment.toFixed(0)}
            <span className="text-lg text-gray-600">/mo</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {deal.term_months} months • {(deal.annual_mileage / 1000).toFixed(1)}k mi/yr
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Drive-off:</span>
            <span className="font-semibold">${driveOff.toFixed(0)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Save:</span>
              <span className="font-semibold text-green-600">${savings.toFixed(0)}</span>
            </div>
          )}
        </div>

        <Link to={`/deal/${deal.id}`}>
          <Button className="w-full bg-red-600 hover:bg-red-700">
            View Deal →
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
