import React from 'react';

const WhyDealAvailable = () => {
  return (
    <div className="bg-blue-50 border border-blue-300 rounded-xl p-6">
      <h3 className="font-bold text-lg mb-3">Why This Deal is Available</h3>
      <div className="space-y-2 text-sm text-gray-700">
        <p>
          ✓ <strong>Fleet-level pricing</strong> normally available only to rental companies.
        </p>
        <p>
          ✓ <strong>Dealer must move excess inventory</strong> before month-end — you get the discount.
        </p>
        <p>
          ✓ <strong>No dealer add-ons</strong> (average $5,500), no markup, no hidden fees.
        </p>
      </div>
    </div>
  );
};

export default WhyDealAvailable;