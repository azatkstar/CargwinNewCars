import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, FileText, Car, Phone } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const WhatToExpect = () => {
  const timeline = [
    { hour: 'Hour 0', icon: Phone, title: 'You Book', details: ['Click Reserve Price', 'Pay $97.49 deposit', 'Confirmation email'], duration: '2 min' },
    { hour: 'Hour 1-4', icon: CheckCircle, title: 'Soft Credit Check', details: ['Soft pull (no score impact)', 'Verify info', 'Check dealer availability'], duration: '1-4h' },
    { hour: 'Hour 4-24', icon: FileText, title: 'Dealer Verification', details: ['Car confirmed', 'VIN assigned', 'Final offer calculated'], duration: 'Up to 24h' },
    { hour: 'Hour 24', icon: CheckCircle, title: 'Final Offer', details: ['Email with exact payment', 'Full breakdown', 'Approve or cancel'], duration: '24h max' },
    { hour: 'Day 2', icon: FileText, title: 'E-Sign', details: ['Hard pull if approved', 'E-sign online', 'Upload insurance'], duration: '15 min' },
    { hour: 'Day 2-4', icon: Car, title: 'Delivery', details: ['Schedule pickup', 'Car ready', 'Drive away'], duration: '0-2 days' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-4">What to Expect</h1>
        <p className="text-xl text-gray-600 text-center mb-16">Timeline from booking to driving</p>
        
        <div className="space-y-8">
          {timeline.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex gap-6">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex justify-between mb-3">
                    <div>
                      <div className="text-sm text-red-600 font-semibold">{s.hour}</div>
                      <h3 className="text-xl font-bold">{s.title}</h3>
                    </div>
                    <div className="text-xs bg-gray-100 px-3 py-1 rounded-full">{s.duration}</div>
                  </div>
                  <ul className="space-y-1">
                    {s.details.map((d, j) => (
                      <li key={j} className="text-sm text-gray-700 flex gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mt-12">
          <h3 className="font-bold text-lg mb-3">Important:</h3>
          <ul className="space-y-2 text-sm">
            <li>• Soft check first - no credit impact</li>
            <li>• Rates vary by YOUR credit score</li>
            <li>• Fully refundable before e-sign</li>
            <li>• CA residents only</li>
            <li>• Offers sell fast - book ASAP</li>
          </ul>
        </div>

        <div className="text-center mt-12">
          <Link to="/">
            <button className="bg-red-600 text-white px-8 py-4 rounded-xl text-lg font-semibold">Browse Offers</button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WhatToExpect;