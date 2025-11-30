import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Search, Calculator, FileCheck, Truck } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="w-12 h-12" />,
      title: 'Browse Fleet Offers',
      description: 'Explore our curated selection of brand-new vehicles with transparent fleet pricing. Filter by make, model, monthly payment, or savings.',
      details: [
        'Updated weekly with fresh inventory',
        'Fleet pricing visible upfront',
        'No hidden fees or dealer markups',
        'Real-time availability'
      ]
    },
    {
      icon: <Calculator className="w-12 h-12" />,
      title: 'Calculate Your Payment',
      description: 'Use our professional lease calculator to see exact monthly payments based on your credit tier, down payment, and term preferences.',
      details: [
        'Real-time payment calculation',
        'Adjust term, mileage, and down payment',
        'See all fees and taxes included',
        'Compare lease vs. finance options'
      ]
    },
    {
      icon: <FileCheck className="w-12 h-12" />,
      title: 'Reserve & Get Approved',
      description: 'Reserve your vehicle for free (no payment required). We run a soft credit check to confirm your exact rate and monthly payment.',
      details: [
        'Free reservation (cancel anytime)',
        'Soft credit inquiry (no score impact)',
        '24-hour approval turnaround',
        'Work with all credit tiers (680+)'
      ]
    },
    {
      icon: <Truck className="w-12 h-12" />,
      title: 'Sign & Delivery',
      description: 'E-sign your contract online and schedule delivery. We bring the car to you or arrange pickup at our partner location.',
      details: [
        'Electronic contract signing',
        'Free home delivery available',
        'Final walkthrough and inspection',
        'Drive away the same day'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>How It Works - hunter.lease by Cargwin</title>
        <meta name="description" content="Learn how to lease a new car online with hunter.lease. Simple 4-step process from browsing to delivery." />
      </Helmet>
      
      <Header />
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">How It Works</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Lease a new car in 4 simple steps. From browsing to delivery, everything happens online.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="space-y-16">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl flex items-center justify-center">
                  {step.icon}
                </div>
                <div className="mt-4 text-center">
                  <div className="text-2xl font-bold text-red-600">Step {idx + 1}</div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-600 mt-1">✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Common Questions</h2>
          <div className="space-y-4">
            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold cursor-pointer">Do I have to visit a dealership?</summary>
              <p className="mt-3 text-gray-600">No! The entire process is 100% online. You can browse, reserve, get approved, and sign your contract from home. We deliver the car to you or you can pick it up.</p>
            </details>
            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold cursor-pointer">How long does the process take?</summary>
              <p className="mt-3 text-gray-600">From reservation to delivery: 24-48 hours. Approval typically happens within 24 hours, and we can deliver your car the next day.</p>
            </details>
            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold cursor-pointer">Can I cancel my reservation?</summary>
              <p className="mt-3 text-gray-600">Yes! Reservations are free and can be cancelled anytime before you sign the final contract. No penalties, no questions asked.</p>
            </details>
            <details className="bg-white rounded-lg p-6 shadow-sm">
              <summary className="font-semibold cursor-pointer">What credit score do I need?</summary>
              <p className="mt-3 text-gray-600">We work with credit scores 680+. Lower scores may require a higher down payment or have slightly higher rates, but we work with all major credit tiers.</p>
            </details>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;
