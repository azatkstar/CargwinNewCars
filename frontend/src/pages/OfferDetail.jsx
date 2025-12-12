import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffer();
  }, [id]);

  const loadOffer = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/offers/${id}`);
      
      if (!response.ok) {
        throw new Error('Offer not found');
      }

      const data = await response.json();
      setOffer(data);
    } catch (error) {
      console.error('Error loading offer:', error);
      alert('Offer not found');
      navigate('/deals');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-gray-500">Loading offer...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!offer) {
    return null;
  }

  const image = (offer.images && offer.images[0]) || offer.image || 'https://via.placeholder.com/800x500';
  const payment = offer.monthlyPayment || offer.lease?.monthly || 0;

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{offer.title} | Hunter.Lease</title>
        <meta name="description" content={`Lease deal for ${offer.title}`} />
      </Helmet>

      <Header />

      {/* Offer Detail */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-4">
          <a href="/deals" className="hover:text-red-600">Deals</a>
          {' > '}
          <span>{offer.title}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Image */}
          <div>
            <div className="rounded-xl overflow-hidden bg-gray-100">
              <img
                src={image}
                alt={offer.title}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{offer.title}</h1>
              <div className="text-sm text-gray-600">
                {offer.year} • {offer.dealType || 'Lease'}
              </div>
            </div>

            {/* Price */}
            <Card>
              <CardContent className="pt-6">
                {payment > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Monthly Payment</div>
                    <div className="text-4xl font-bold text-red-600">
                      ${payment}/mo
                    </div>
                    {offer.lease?.termMonths && (
                      <div className="text-sm text-gray-600 mt-1">
                        {offer.lease.termMonths} months • {offer.lease.milesPerYear || 10000} mi/yr
                      </div>
                    )}
                  </div>
                )}

                {offer.msrp && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">MSRP:</span>
                      <span className="font-semibold">${offer.msrp.toLocaleString()}</span>
                    </div>
                    {offer.discount > 0 && (
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-semibold text-green-600">-${offer.discount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="space-y-3">
              <Button className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg">
                Apply Now
              </Button>
              <Button
                variant="outline"
                className="w-full py-6 text-lg"
                onClick={() => window.open('https://t.me/SalesAzatAuto', '_blank')}
              >
                💬 Contact Us
              </Button>
            </div>

            {/* Details */}
            {offer.specs && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Specifications</h3>
                  <div className="space-y-2 text-sm">
                    {offer.specs.transmission && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transmission:</span>
                        <span>{offer.specs.transmission}</span>
                      </div>
                    )}
                    {offer.specs.drivetrain && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Drivetrain:</span>
                        <span>{offer.specs.drivetrain}</span>
                      </div>
                    )}
                    {offer.specs.exteriorColor && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exterior:</span>
                        <span>{offer.specs.exteriorColor}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
