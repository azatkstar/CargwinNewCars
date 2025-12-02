import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Filter, Heart, TrendingDown } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function OffersPage() {
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [brand, setBrand] = useState('all');
  const [paymentMax, setPaymentMax] = useState(1000);
  const [sortBy, setSortBy] = useState('payment');
  const [showFilters, setShowFilters] = useState(false);

  // Load deals
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/deals/list?limit=50`)
      .then(res => res.json())
      .then(data => {
        setDeals(data.deals || []);
        setFilteredDeals(data.deals || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading deals:', err);
        setLoading(false);
      });
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...deals];

    // Brand filter
    if (brand !== 'all') {
      result = result.filter(d => d.brand?.toLowerCase() === brand.toLowerCase());
    }

    // Payment filter
    result = result.filter(d => (d.calculated_payment || 0) <= paymentMax);

    // Sorting
    if (sortBy === 'payment') {
      result.sort((a, b) => (a.calculated_payment || 0) - (b.calculated_payment || 0));
    } else if (sortBy === 'savings') {
      result.sort((a, b) => (b.savings_vs_msrp || 0) - (a.savings_vs_msrp || 0));
    }

    setFilteredDeals(result);

    // Analytics event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'filter_change', {
        brand,
        payment_max: paymentMax,
        sort: sortBy
      });
    }
  }, [brand, paymentMax, sortBy, deals]);

  const brands = ['all', ...new Set(deals.map(d => d.brand).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-gray-500">Loading deals...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Best Car Lease Deals | Hunter.Lease California</title>
        <meta name="description" content="Browse the best car lease deals with real bank programs. Transparent pricing, instant approval." />
      </Helmet>

      <Header />

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Car Lease Deals</h1>
          <p className="text-gray-600">
            {filteredDeals.length} deals found
          </p>
        </div>

        {/* Filters - Desktop */}
        <div className="hidden md:flex gap-4 mb-6 items-center flex-wrap">
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              {brands.map(b => (
                <SelectItem key={b} value={b}>
                  {b === 'all' ? 'All Brands' : b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Max Payment:</span>
            <Select value={paymentMax.toString()} onValueChange={(v) => setPaymentMax(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500">$500</SelectItem>
                <SelectItem value="700">$700</SelectItem>
                <SelectItem value="1000">$1000</SelectItem>
                <SelectItem value="5000">Any</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payment">Lowest Payment</SelectItem>
              <SelectItem value="savings">Biggest Savings</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters - Mobile */}
        <div className="md:hidden mb-6">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="w-full"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters ({filteredDeals.length} deals)
          </Button>
          
          {showFilters && (
            <div className="mt-4 space-y-3 bg-white p-4 rounded-lg border">
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(b => (
                    <SelectItem key={b} value={b}>{b === 'all' ? 'All Brands' : b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={paymentMax.toString()} onValueChange={(v) => setPaymentMax(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Max Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">Under $500</SelectItem>
                  <SelectItem value="700">Under $700</SelectItem>
                  <SelectItem value="1000">Under $1000</SelectItem>
                  <SelectItem value="5000">Any Price</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Lowest Payment</SelectItem>
                  <SelectItem value="savings">Biggest Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Deals Grid - Compact Cards */}
        {filteredDeals.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No deals match your filters. Try adjusting them!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredDeals.map(deal => (
              <CompactDealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// Compact Deal Card Component
function CompactDealCard({ deal }) {
  const monthlyPayment = deal.calculated_payment || 0;
  const savings = deal.savings_vs_msrp || 0;

  const handleCardClick = () => {
    // Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'deal_card_click', {
        deal_id: deal.id,
        brand: deal.brand,
        model: deal.model
      });
    }
  };

  return (
    <Link to={`/deal/${deal.id}`} onClick={handleCardClick}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer">
        {/* Image */}
        <div className="h-48 sm:h-56 bg-gray-200 overflow-hidden">
          {deal.image_url ? (
            <img
              src={deal.image_url}
              alt={`${deal.year} ${deal.brand} ${deal.model}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-6xl">🚗</span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-bold text-lg mb-1">
            {deal.year} {deal.brand} {deal.model}
          </h3>
          {deal.trim && (
            <p className="text-sm text-gray-600 mb-3">{deal.trim}</p>
          )}

          {/* Price - Big & Bold */}
          <div className="mb-3">
            <div className="text-3xl font-bold text-red-600">
              ${monthlyPayment.toFixed(0)}
              <span className="text-base text-gray-600 font-normal">/mo</span>
            </div>
            <div className="text-sm text-gray-500">
              {deal.term_months}mo • {(deal.annual_mileage / 1000).toFixed(1)}k mi/yr
            </div>
          </div>

          {/* Savings Badge */}
          {savings > 0 && (
            <div className="mb-3">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <TrendingDown className="w-3 h-3 mr-1 inline" />
                Save ${savings.toFixed(0)}
              </Badge>
            </div>
          )}

          {/* FOMO - Simple */}
          {deal.stock_count && deal.stock_count <= 3 && (
            <div className="text-xs text-orange-600 mb-3">
              🔥 Only {deal.stock_count} left
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-2">
            <Button className="flex-1 bg-red-600 hover:bg-red-700">
              View Deal
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                // Add to favorites logic
              }}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
