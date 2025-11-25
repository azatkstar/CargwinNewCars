import React from 'react';
import { Star } from 'lucide-react';

const CustomerStoriesAmazon = () => {
  const testimonials = [
    {
      name: 'Michael',
      location: 'Orange County',
      avatar: 'https://i.pravatar.cc/150?img=12',
      rating: 5,
      text: 'RAV4 picked up next day. Dealer quoted $580/mo, here got $379.'
    },
    {
      name: 'Jessica',
      location: 'Los Angeles',
      avatar: 'https://i.pravatar.cc/150?img=47',
      rating: 5,
      text: 'Not a single add-on. Signed contract in 5 minutes online.'
    },
    {
      name: 'David',
      location: 'Riverside',
      avatar: 'https://i.pravatar.cc/150?img=33',
      rating: 5,
      text: 'Thought I wouldn't qualify. They found a bank - picked up in 24h.'
    }
  ];

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
      <h3 className="font-bold text-xl mb-6">Real Customer Stories</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-bold text-gray-900">{testimonial.name}</div>
                <div className="text-xs text-gray-600">{testimonial.location}</div>
              </div>
            </div>
            
            <div className="flex gap-1 mb-3">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            
            <p className="text-sm text-gray-700 leading-relaxed">
              "{testimonial.text}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerStoriesAmazon;
