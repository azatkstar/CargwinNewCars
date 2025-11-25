import React from 'react';
import { DollarSign } from 'lucide-react';

const WhyThisPriceBlock = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-6">
      <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-blue-600" />
        Why This Price?
      </h3>
      
      <div className="space-y-3 text-sm text-gray-700">
        <p className="leading-relaxed">
          <strong>Fleet pricing</strong> normally available only to rental companies and corporate bulk orders.
        </p>
        <p className="leading-relaxed">
          <strong>Dealer must close inventory</strong> before month-end reporting period.
        </p>
        <p className="leading-relaxed">
          <strong>We eliminate add-ons and markup:</strong> $0 dealer add-ons instead of $5,500 typical.
        </p>
        <p className="leading-relaxed">
          All savings go directly to you.
        </p>
      </div>
    </div>
  );
};

export default WhyThisPriceBlock;
