import React from 'react';
import { TrendingDown, Ban, Monitor, Shield } from 'lucide-react';

const WhyHunterLeaseCards = () => {
  const benefits = [
    {
      icon: <TrendingDown className="w-8 h-8" />,
      title: 'Fleet Pricing',
      description: 'Corporate bulk order rates, now available to you'
    },
    {
      icon: <Ban className="w-8 h-8" />,
      title: 'Zero Add-Ons',
      description: 'No forced packages. No hidden $5,500 dealer extras'
    },
    {
      icon: <Monitor className="w-8 h-8" />,
      title: '100% Online',
      description: 'No dealer visits. No pressure. No haggling'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'All Credit Tiers',
      description: 'Work with Tier 1-6. We find financing for you'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-6">
      <h3 className="font-bold text-xl mb-6 text-center">Why Hunter.Lease?</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, idx) => (
          <div key={idx} className="bg-white rounded-lg p-5 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 text-blue-600">
              {benefit.icon}
            </div>
            <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
            <p className="text-sm text-gray-600">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyHunterLeaseCards;
