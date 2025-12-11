import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cars`);
      const data = await response.json();
      
      // Filter: только published offers
      const published = data.filter(o => o.published !== false);
      
      setOffers(published);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-gray-500">Loading offers...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Car Lease Deals | Hunter.Lease</title>
        <meta name="description" content="Browse car lease deals in California" />
      </Helmet>

      <Header />

      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Car Lease Deals</h1>
          <p className="text-gray-600">{offers.length} offers available</p>
        </div>

        {offers.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No offers available. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map(offer => (
              <SimpleOfferCard key={offer.id || offer._id} offer={offer} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function SimpleOfferCard({ offer }) {
  const image = (offer.images && offer.images[0]) || offer.image || 'https://via.placeholder.com/400x250';
  const payment = offer.monthlyPayment || offer.lease?.monthly || 0;
  const slug = offer.slug || offer.id || offer._id;

  return (
    <Link to={`/car/${slug}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all cursor-pointer">
        <div className="h-48 bg-gray-200">
          <img
            src={image}
            alt={offer.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-2">{offer.title}</h3>
          
          <div className="text-sm text-gray-600 mb-3">
            {offer.year} • {offer.dealType || 'Lease'}
          </div>

          {payment > 0 && (
            <div className="text-2xl font-bold text-red-600 mb-3">
              ${payment}/mo
            </div>
          )}

          <Button className="w-full bg-red-600 hover:bg-red-700">
            View Deal
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
