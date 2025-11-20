import React from 'react';
import { Star, Quote } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ReviewsPage = () => {
  const reviews = [
    {
      name: "Michael Chen",
      location: "Los Angeles, CA",
      car: "2025 Toyota Camry Hybrid",
      rating: 5,
      date: "November 2025",
      text: "Saved $6,200 compared to dealer pricing. The whole process was 100% online - no pressure, no haggling. Got my car delivered to my home in 2 days. CargwinGPT helped me find the perfect car for my budget.",
      savings: 6200
    },
    {
      name: "Sarah Martinez",
      location: "Irvine, CA",
      car: "2025 Lexus RX 350",
      rating: 5,
      date: "November 2025",
      text: "As a busy professional, I appreciated not having to visit multiple dealers. hunter.lease gave me fleet pricing and handled everything remotely. Finance Manager was super helpful explaining the terms.",
      savings: 12800
    },
    {
      name: "James Thompson",
      location: "San Diego, CA",
      car: "2025 Honda CR-V",
      rating: 5,
      date: "October 2025",
      text: "My credit score is 680 (Tier 2) and I was worried about approval. They not only approved me but suggested 3 alternatives that fit my budget perfectly. Ended up saving $8K!",
      savings: 8400
    },
    {
      name: "Lisa Wang",
      location: "San Francisco, CA",
      car: "2025 Genesis G80",
      rating: 5,
      date: "October 2025",
      text: "The AI assistant (CargwinGPT) answered all my questions at 2am when I couldn't sleep. Next day, Finance Manager called and we wrapped up the deal. Super professional service.",
      savings: 9500
    },
    {
      name: "David Rodriguez",
      location: "Long Beach, CA",
      car: "2025 Toyota RAV4",
      rating: 5,
      date: "September 2025",
      text: "Had negative equity on my trade-in. They rolled it into the new lease at a much lower rate than my old loan. Saved money AND got a new car. Transparent pricing throughout.",
      savings: 5800
    }
  ];

  const stats = {
    totalReviews: 247,
    avgRating: 4.8,
    avgSavings: 8500,
    satisfactionRate: 98
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Customer Reviews
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Real people. Real savings. Real stories.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-gray-900">{stats.totalReviews}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                {stats.avgRating}
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-600">${(stats.avgSavings / 1000).toFixed(1)}K</div>
              <div className="text-sm text-gray-600">Avg Savings</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-600">{stats.satisfactionRate}%</div>
              <div className="text-sm text-gray-600">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-8 border border-gray-200">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>

              <Quote className="w-8 h-8 text-gray-300 mb-3" />
              
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                "{review.text}"
              </p>

              <div className="border-t pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{review.name}</p>
                    <p className="text-sm text-gray-600">{review.location}</p>
                    <p className="text-sm text-gray-500">{review.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                      Saved ${review.savings.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{review.car}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Save on Your Next Car?</h2>
          <p className="text-xl mb-8 text-red-100">
            Join 247+ satisfied customers who saved an average of $8,500
          </p>
          <a href="/offers">
            <button className="bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100">
              Browse Current Deals
            </button>
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ReviewsPage;
