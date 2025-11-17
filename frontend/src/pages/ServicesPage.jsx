import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, TrendingDown, Phone, Car, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ServicesPage = () => {
  const services = [
    {
      icon: TrendingDown,
      title: "Fleet Dump Offers",
      description: "Access to exclusive dealer dump pricing - inventory they need to move fast.",
      features: [
        "$5K-$15K below retail pricing",
        "Real monthly payments, no 'starting at' games",
        "Updated monthly with fresh inventory",
        "Pre-screened deals only"
      ]
    },
    {
      icon: Shield,
      title: "Credit Pre-Qualification",
      description: "Soft credit check that won't hurt your score. Know your options before applying.",
      features: [
        "Soft pull only - no score impact",
        "Get your tier and estimated rate",
        "Multiple lender options",
        "Pre-approval in 24 hours"
      ]
    },
    {
      icon: Phone,
      title: "Financing Consultation",
      description: "Free advice from Finance Managers who work for you, not dealers.",
      features: [
        "Compare lease vs finance vs cash",
        "Find best deal for YOUR credit score",
        "Explain all fees and terms",
        "No sales pressure"
      ]
    },
    {
      icon: Car,
      title: "Car Selection Help",
      description: "Not sure which car fits your budget? We help you find the right match.",
      features: [
        "Budget-based recommendations",
        "Alternative suggestions",
        "Compare multiple models side-by-side",
        "Trade-in valuation"
      ]
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Questions? We're here. Call, text, or email anytime.",
      features: [
        "Phone: +1 (747) CARGWIN",
        "Email: info@cargwin.com",
        "Live chat on website",
        "Average response: 12 minutes"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to get the best lease deal in Los Angeles
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div key={idx} className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 hover:border-red-500 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-red-100">
            Browse current dump offers or talk to a Finance Manager
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/offers">
              <button className="bg-white text-red-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100">
                Browse Offers
              </button>
            </Link>
            <a href="tel:+17477227494">
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-red-800">
                Call Now
              </button>
            </a>
          </div>
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

export default ServicesPage;
