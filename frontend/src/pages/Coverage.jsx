import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Check, X } from 'lucide-react';

const Coverage = () => {
  const states = [
    { name: 'California', available: true, note: 'Full service coverage' },
    { name: 'Nevada', available: true, note: 'Pickup only' },
    { name: 'Arizona', available: true, note: 'Delivery available' },
    { name: 'Oregon', available: false, note: 'Coming soon' },
    { name: 'Washington', available: false, note: 'Coming soon' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Coverage Areas - Where We Serve | hunter.lease</title>
        <meta name="description" content="Check if hunter.lease serves your area. Currently available in California with expansion to neighboring states." />
      </Helmet>
      
      <Header />
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-12 h-12" />
            <h1 className="text-5xl font-bold">Coverage Areas</h1>
          </div>
          <p className="text-xl opacity-90 max-w-3xl">
            Check if we serve your area. We're constantly expanding to bring fleet pricing to more customers.
          </p>
        </div>
      </div>

      {/* Primary Coverage */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 mb-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Check className="w-8 h-8 text-green-600" />
            Primary Service Area: California
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Full service availability</strong> throughout California, including:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-3">Major Metro Areas</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Los Angeles & Orange County
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  San Francisco Bay Area
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  San Diego
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Sacramento
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Inland Empire (Riverside/San Bernardino)
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3">Services Available</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Free home delivery
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Dealer pickup coordination
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Registration & DMV processing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  In-person support available
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  All credit tiers accepted
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* States List */}
        <h2 className="text-3xl font-bold mb-8">State-by-State Availability</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {states.map((state, idx) => (
            <div key={idx} className={`border-2 rounded-xl p-6 ${
              state.available 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">{state.name}</h3>
                  <p className={`text-sm ${
                    state.available ? 'text-green-700' : 'text-gray-600'
                  }`}>
                    {state.note}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  state.available ? 'bg-green-200' : 'bg-gray-200'
                }`}>
                  {state.available ? (
                    <Check className="w-6 h-6 text-green-700" />
                  ) : (
                    <X className="w-6 h-6 text-gray-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Delivery Options</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-3">Home Delivery</h3>
              <p className="text-gray-700 mb-4">
                We bring your new vehicle directly to your home or office at no extra charge within our California service area.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Free within 25 miles of dealer
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Scheduled at your convenience
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Full vehicle walkthrough
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-3">Dealer Pickup</h3>
              <p className="text-gray-700 mb-4">
                Pick up your vehicle from our partner dealership location. Available same-day after approval.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Faster availability
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Meet with delivery specialist
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  Test drive before final signing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Expansion */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Not in Your Area Yet?</h2>
        <p className="text-gray-700 leading-relaxed mb-8">
          We're actively expanding to new states. Sign up to be notified when we launch in your area, and you'll get exclusive early access to our best deals.
        </p>
        <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg">
          Notify Me About Expansion
        </button>
      </div>
      
      <Footer />
    </div>
  );
};

export default Coverage;
