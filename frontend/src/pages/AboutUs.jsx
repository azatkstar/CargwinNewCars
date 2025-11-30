import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Car, Shield, DollarSign, Users } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>About Us - Cargwin LLC | hunter.lease</title>
        <meta name="description" content="Learn about Cargwin LLC and our mission to revolutionize car leasing with transparent fleet pricing and online convenience." />
      </Helmet>
      
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">About Cargwin LLC</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            Your trusted partner for transparent car leasing. We're disrupting the traditional dealership model with fleet pricing and online convenience.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              At Cargwin LLC, we believe car leasing should be simple, transparent, and fair. That's why we've built <strong>hunter.lease</strong> — an online platform that gives you direct access to fleet pricing without the dealership markup.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              No haggling. No hidden fees. No pressure. Just honest deals on brand-new vehicles, delivered right to your door.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We work with top manufacturers and financial institutions to secure the best rates, then pass the savings directly to you.
            </p>
          </div>
          <div className="bg-gray-50 p-8 rounded-xl">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Fleet Pricing</h3>
                  <p className="text-sm text-gray-600">Same rates rental companies and large fleets pay</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Full Transparency</h3>
                  <p className="text-sm text-gray-600">No dealer add-ons, no hidden fees, no surprises</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Car className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">100% Online</h3>
                  <p className="text-sm text-gray-600">Reserve, approve, and sign from anywhere</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">$10K+</div>
              <div className="text-gray-600">Average Customer Savings</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">2,500+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">4.9★</div>
              <div className="text-gray-600">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* How We're Different */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">How We're Different</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-red-600">Traditional Dealership</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">✗</span>
                <span className="text-gray-600">High-pressure sales tactics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">✗</span>
                <span className="text-gray-600">$5,000+ dealer add-ons and markups</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">✗</span>
                <span className="text-gray-600">Hours of negotiation required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">✗</span>
                <span className="text-gray-600">Hidden fees and fine print</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 mt-1">✗</span>
                <span className="text-gray-600">Must visit in person</span>
              </li>
            </ul>
          </div>
          <div className="border-2 border-green-200 bg-green-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-green-600">Cargwin / hunter.lease</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">Zero pressure, browse at your pace</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">$0 dealer add-ons, fleet pricing only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">Fixed prices, no negotiation needed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">Full price transparency upfront</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">Complete process 100% online</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Cargwin LLC</h2>
          <p className="text-gray-300 mb-4">2855 Michelle Dr, Office 180, Irvine, CA 92606</p>
          <p className="text-gray-300 mb-4">+1 (747) CARGWIN</p>
          <p className="text-gray-300 mb-8">info@cargwin.com</p>
          <div className="text-sm text-gray-400">
            <p>Licensed California Auto Broker</p>
            <p>NMLS #XXXXXX | CA DMV License #XXXXXX</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutUs;
