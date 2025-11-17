import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CoveragePage = () => {
  const areas = [
    "Los Angeles", "Beverly Hills", "Santa Monica", "West Hollywood",
    "Pasadena", "Glendale", "Burbank", "Irvine", "Newport Beach",
    "Costa Mesa", "Huntington Beach", "Long Beach", "Torrance",
    "Manhattan Beach", "El Segundo", "Culver City", "Downtown LA"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Service Coverage
          </h1>
          <p className="text-xl text-gray-600">
            hunter.lease serves Los Angeles County and Southern California
          </p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-8 mb-12">
          <div className="flex items-start gap-4">
            <MapPin className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-blue-900 mb-2">
                California Residents Only
              </h3>
              <p className="text-gray-700 mb-4">
                Due to California-specific lease regulations and dealer partnerships, 
                we currently serve residents with valid California address and driver's license.
              </p>
              <p className="text-sm text-gray-600">
                Expanding to other states soon. Join waitlist for early access.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Primary Service Areas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {areas.map(area => (
              <div key={area} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">{area}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl p-8">
          <h3 className="font-bold text-lg mb-4">Delivery Options</h3>
          <div className="space-y-3 text-sm">
            <p className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Free Home Delivery:</strong> Within 50 miles of our Irvine office (0-2 days)</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Dealer Pickup:</strong> Available at participating dealers across LA & OC</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span><strong>Extended Delivery:</strong> Up to 100 miles - contact us for quote</span>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Not in our coverage area?</p>
          <Link to="/early-access">
            <button className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700">
              Join Waitlist for Your Area
            </button>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="text-red-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CoveragePage;
