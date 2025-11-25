import React from 'react';
import { MousePointerClick, CheckCircle2, Truck } from 'lucide-react';

const ReservationStepsCards = () => {
  const steps = [
    {
      icon: <MousePointerClick className="w-8 h-8 text-blue-600" />,
      title: 'Reserve Online — 2 minutes',
      description: 'We block the price and vehicle. No payment required.'
    },
    {
      icon: <CheckCircle2 className="w-8 h-8 text-green-600" />,
      title: 'Soft Credit Check — 24h',
      description: 'No credit score impact. We confirm your exact monthly payment.'
    },
    {
      icon: <Truck className="w-8 h-8 text-orange-600" />,
      title: 'Delivery or Pickup — 0-2 days',
      description: 'E-sign contract. Choose pickup or free home delivery.'
    }
  ];

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
      <h3 className="font-bold text-xl mb-6 text-center">
        What Happens After You Reserve?
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            <div className="mb-4 p-4 bg-gray-50 rounded-full">
              {step.icon}
            </div>
            <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-sm text-green-900">
          ✓ Cancel anytime before final contract<br />
          ✓ Full refund if you change your mind
        </p>
      </div>
    </div>
  );
};

export default ReservationStepsCards;
