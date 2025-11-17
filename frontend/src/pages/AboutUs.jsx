import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, TrendingDown, Users, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            About hunter.lease
          </h1>
          <p className="text-xl text-gray-600">
            We hunt down real dealer dump offers so you don't have to.
          </p>
        </div>

        {/* Our Story */}
        <div className="prose prose-lg max-w-none mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            hunter.lease was born from a simple frustration: why is car leasing so complicated and expensive? 
            We saw dealers sitting on inventory they needed to move fast, and customers paying full MSRP 
            because they didn't know about these dump offers.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            So we built a platform that connects the two. Dealers get their inventory moving. 
            Customers get real dump pricing. Everyone wins.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We're not a dealership. We're not salespeople. We're hunters - finding the best lease 
            deals in Los Angeles and Southern California, verifying them, and presenting them with 
            complete transparency.
          </p>
        </div>

        {/* Our Mission */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700">
            Make car leasing <strong>honest, transparent, and fast</strong>. No BS. No dealer games. 
            Just real dump offers with real prices for real people in LA.
          </p>
        </div>

        {/* Why Trust Us */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Dealers Trust Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
              <TrendingDown className="w-10 h-10 text-green-600 mb-3" />
              <h3 className="font-bold mb-2">Fast Inventory Turnover</h3>
              <p className="text-sm text-gray-600">
                We help dealers move cars in days, not weeks. They save on holding costs, we find buyers fast.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
              <Users className="w-10 h-10 text-blue-600 mb-3" />
              <h3 className="font-bold mb-2">Qualified Buyers Only</h3>
              <p className="text-sm text-gray-600">
                We pre-screen buyers. Dealers get serious customers who are ready to sign, not tire-kickers.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
              <Shield className="w-10 h-10 text-purple-600 mb-3" />
              <h3 className="font-bold mb-2">Protected Reputation</h3>
              <p className="text-sm text-gray-600">
                We handle customer service. Dealers avoid complaints and focus on delivering cars.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
              <Clock className="w-10 h-10 text-red-600 mb-3" />
              <h3 className="font-bold mb-2">Monthly Refresh</h3>
              <p className="text-sm text-gray-600">
                Fresh dump offers every month. Dealers clear old inventory, make room for new models.
              </p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="bg-gray-50 p-8 rounded-xl mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-2xl">✓</span>
              <div>
                <strong className="block">Honesty</strong>
                <span className="text-sm text-gray-600">
                  No "starting at" prices. No hidden fees. What you see is what you pay.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <strong className="block">Privacy</strong>
                <span className="text-sm text-gray-600">
                  Your data is encrypted and protected. We don't sell it. We don't spam you.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <strong className="block">Speed</strong>
                <span className="text-sm text-gray-600">
                  Dump offers move fast. We match fast buyers with fast deals. 24-hour turnaround.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <strong className="block">Customer First</strong>
                <span className="text-sm text-gray-600">
                  We work for you, not dealers. Our job is finding you the best deal, period.
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Questions? We're Here</h3>
          <p className="text-gray-600 mb-4">
            <a href="tel:+17477227494" className="text-red-600 hover:underline font-bold">
              +1 (747) CARGWIN
            </a>
          </p>
          <p className="text-sm text-gray-500">
            9AM-9PM PST, 7 days a week
          </p>
        </div>

        <div className="mt-12 pt-6 border-t">
          <Link to="/" className="text-red-600 hover:underline">
            ← Back to Offers
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;
