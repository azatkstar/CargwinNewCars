import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Clock, DollarSign, FileCheck, Shield } from 'lucide-react';

const WhatToExpect = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>What to Expect - The hunter.lease Experience</title>
        <meta name="description" content="Learn what to expect when leasing through hunter.lease. Transparent process, no surprises, full support." />
      </Helmet>
      
      <Header />
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">What to Expect</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            Leasing a car should be simple and transparent. Here's exactly what happens when you work with hunter.lease.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Your Journey with Us</h2>
        
        <div className="space-y-12">
          {/* Day 0 - Browse */}
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-32 text-right">
              <div className="text-2xl font-bold text-red-600">Day 0</div>
              <div className="text-sm text-gray-600">Browse</div>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Browse Fleet Offers</h3>
              <p className="text-gray-700 mb-4">
                Explore our curated selection of brand-new vehicles. All prices are transparent fleet pricing with no hidden fees or dealer markups.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="block mb-1">What You'll See:</strong>
                  <ul className="space-y-1 text-gray-600">
                    <li>✓ MSRP and your discount</li>
                    <li>✓ Fleet price (final selling price)</li>
                    <li>✓ Estimated monthly payment</li>
                    <li>✓ Real-time availability</li>
                  </ul>
                </div>
                <div>
                  <strong className="block mb-1">No Pressure:</strong>
                  <ul className="space-y-1 text-gray-600">
                    <li>✓ Browse at your own pace</li>
                    <li>✓ No registration required to view</li>
                    <li>✓ Compare multiple vehicles</li>
                    <li>✓ Save favorites for later</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Day 0 - Reserve */}
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-32 text-right">
              <div className="text-2xl font-bold text-red-600">Day 0</div>
              <div className="text-sm text-gray-600">2-5 minutes</div>
            </div>
            <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Free Reservation</h3>
              <p className="text-gray-700 mb-4">
                Found your car? Reserve it for free. We hold the vehicle and price for you while we work on your approval.
              </p>
              <div className="bg-white rounded-lg p-4 mb-4">
                <strong className="block mb-2">What Happens:</strong>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Enter basic contact info (name, email, phone)</li>
                  <li>✓ Vehicle is held for 48 hours</li>
                  <li>✓ No payment required</li>
                  <li>✓ No commitment - cancel anytime</li>
                  <li>✓ Instant confirmation email</li>
                </ul>
              </div>
              <div className="text-sm text-blue-900">
                <strong>💡 Pro Tip:</strong> Popular deals sell out fast. Reserving guarantees your price and availability.
              </div>
            </div>
          </div>

          {/* Day 0-1 - Application */}
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-32 text-right">
              <div className="text-2xl font-bold text-red-600">Day 0-1</div>
              <div className="text-sm text-gray-600">10-15 minutes</div>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Credit Application</h3>
              <p className="text-gray-700 mb-4">
                Complete your application online. We'll run a soft credit check (no score impact) to confirm your rate.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="block mb-2">Information Needed:</strong>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Full name & date of birth</li>
                    <li>• SSN & driver's license</li>
                    <li>• Current address (2+ years)</li>
                    <li>• Employment & income</li>
                  </ul>
                </div>
                <div>
                  <strong className="block mb-2">What We Do:</strong>
                  <ul className="space-y-1 text-gray-600">
                    <li>✓ Soft credit pull (no impact)</li>
                    <li>✓ Verify employment</li>
                    <li>✓ Submit to top lenders</li>
                    <li>✓ Find best rate for you</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Day 1 - Approval */}
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-32 text-right">
              <div className="text-2xl font-bold text-red-600">Day 1</div>
              <div className="text-sm text-gray-600">Within 24h</div>
            </div>
            <div className="flex-1 bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Get Approved</h3>
              <p className="text-gray-700 mb-4">
                We work with multiple lenders to secure your approval. You'll receive a detailed breakdown of your terms.
              </p>
              <div className="bg-white rounded-lg p-4 mb-4">
                <strong className="block mb-2">Your Approval Includes:</strong>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Exact monthly payment (no surprises)</li>
                  <li>✓ Interest rate / money factor</li>
                  <li>✓ Total due at signing</li>
                  <li>✓ All fees and taxes breakdown</li>
                  <li>✓ Terms (months, mileage)</li>
                </ul>
              </div>
              <div className="text-sm text-green-900">
                <strong>✅ Approval Rate:</strong> 95% of applicants with 680+ credit are approved
              </div>
            </div>
          </div>

          {/* Day 1-2 - Delivery */}
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-32 text-right">
              <div className="text-2xl font-bold text-red-600">Day 1-2</div>
              <div className="text-sm text-gray-600">Final step</div>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Sign & Delivery</h3>
              <p className="text-gray-700 mb-4">
                E-sign your contract and schedule delivery. Your new car arrives within 0-2 days.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="block mb-2">Electronic Signing:</strong>
                  <ul className="space-y-1 text-gray-600">
                    <li>✓ Review contract online</li>
                    <li>✓ E-sign from any device</li>
                    <li>✓ Instant processing</li>
                    <li>✓ Copy emailed to you</li>
                  </ul>
                </div>
                <div>
                  <strong className="block mb-2">Delivery:</strong>
                  <ul className="space-y-1 text-gray-600">
                    <li>✓ Free home delivery</li>
                    <li>✓ OR dealer pickup</li>
                    <li>✓ Full vehicle walkthrough</li>
                    <li>✓ Drive away same day</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Promises */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Promises to You</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">24-48 Hour Process</h3>
              <p className="text-gray-300 text-sm">From reservation to driving away</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">No Hidden Fees</h3>
              <p className="text-gray-300 text-sm">Price you see is price you pay</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Cancel Anytime</h3>
              <p className="text-gray-300 text-sm">Before final contract signing</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">Price Match</h3>
              <p className="text-gray-300 text-sm">Find lower? We'll match it</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default WhatToExpect;
