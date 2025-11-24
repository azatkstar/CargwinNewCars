import React from 'react';
import { Quote } from 'lucide-react';

const MiniTestimonials = () => {
  const testimonials = [
    {
      name: 'Michael',
      location: 'Orange County',
      text: 'Got my RAV4 delivered the next day. Dealer wanted $580/mo, Hunter.Lease got me $379.'
    },
    {
      name: 'Jessica',
      location: 'Los Angeles',
      text: 'Zero add-ons. No pressure. E-signed my contract in 5 minutes.'
    },
    {
      name: 'David',
      location: 'Riverside',
      text: 'Thought I wouldn\'t qualify. They matched me with a bank and I got approved in a day.'
    }
  ];
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-bold text-lg mb-4">Real Customer Stories</h3>
      <div className="space-y-4">
        {testimonials.map((t, idx) => (
          <div key={idx} className="border-l-2 border-green-600 pl-4">
            <Quote className="w-4 h-4 text-gray-400 mb-2" />
            <p className="text-sm text-gray-700 italic mb-2">"{t.text}"</p>
            <p className="text-xs text-gray-500">— {t.name} from {t.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniTestimonials;