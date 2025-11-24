import React from 'react';
import { Shield } from 'lucide-react';

const PriceMatchGuarantee = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">Price Match Guarantee</h3>
          <p className="text-gray-700">
            If the final dealer price is higher, we cover the difference or give you a better offer.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            ✓ Best price guaranteed • ✓ No hidden surprises • ✓ Full transparency
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriceMatchGuarantee;