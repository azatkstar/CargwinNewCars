import React from 'react';
import { CheckCircle, Clock, FileText, Car } from 'lucide-react';

const ProcessSteps = ({ currentStatus = 'pending' }) => {
  const steps = [
    { id: 'submitted', title: 'Application Submitted', icon: FileText, timeline: 'Complete' },
    { id: 'review', title: 'Under Review', icon: Clock, timeline: '2-4 hours' },
    { id: 'prescoring', title: 'Pre-Approval', icon: CheckCircle, timeline: '24 hours' },
    { id: 'approved', title: 'Approved!', icon: CheckCircle, timeline: '24-48 hours' },
    { id: 'contract', title: 'Sign Contract', icon: FileText, timeline: '5 minutes' },
    { id: 'delivery', title: 'Delivery', icon: Car, timeline: '0-2 days' }
  ];

  const statusMap = { 'pending': 1, 'contacted': 2, 'approved': 3, 'contract_sent': 4, 'completed': 6 };
  const currentStep = statusMap[currentStatus] || 1;

  return (
    <div className="bg-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Your Journey</h2>
        <div className="relative">
          <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200" />
          <div className="absolute top-8 left-0 h-1 bg-green-600" style={{ width: `${(currentStep / 6) * 100}%` }} />
          <div className="grid grid-cols-6 gap-4 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const done = idx < currentStep;
              return (
                <div key={idx} className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${done ? 'bg-green-600' : 'bg-gray-200'}`}>
                    <Icon className={`w-8 h-8 ${done ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-gray-500">{step.timeline}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-12 p-6 bg-blue-50 rounded-lg text-center">
          <h3 className="font-bold text-lg mb-2">Questions?</h3>
          <p className="text-sm mb-2">Call: <a href="tel:+17477227494" className="font-bold text-blue-700">+1 (747) CARGWIN</a></p>
          <p className="text-xs text-gray-600">9AM-9PM PST, 7 days/week</p>
        </div>
      </div>
    </div>
  );
};

export default ProcessSteps;