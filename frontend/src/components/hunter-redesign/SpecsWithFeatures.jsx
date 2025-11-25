import React from 'react';
import { Check } from 'lucide-react';

const SpecsWithFeatures = ({ car }) => {
  const keyFeatures = [
    'Adaptive Cruise Control',
    'Lane Keeping Assist',
    'Panoramic Roof',
    'Premium Audio System',
    'Full Safety Suite'
  ];

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
      <h3 className="font-bold text-xl mb-6">Specs & Key Features</h3>
      
      {/* Basic Specs */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Year</span>
          <span className="font-semibold">{car?.specs?.year || car?.title?.split(' ')[0] || '2025'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Make</span>
          <span className="font-semibold">{car?.specs?.make || car?.title?.split(' ')[1] || 'Genesis'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Model</span>
          <span className="font-semibold">{car?.specs?.model || 'G80'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Trim</span>
          <span className="font-semibold">{car?.specs?.trim || '2.5T'}</span>
        </div>
        <div className="flex justify-between col-span-2">
          <span className="text-gray-600">Mileage</span>
          <span className="font-semibold">0 mi (Brand New)</span>
        </div>
      </div>
      
      {/* Key Features */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
        <div className="grid grid-cols-1 gap-2">
          {keyFeatures.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecsWithFeatures;
