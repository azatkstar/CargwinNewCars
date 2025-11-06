import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Eye, TrendingUp, Car, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockOffers } from '../../mock';
import { formatPrice } from '../../utils/timer';
import { getFOMOCounters } from '../../mock';

const SimilarOffers = ({ currentCarId }) => {
  const [similarCars, setSimilarCars] = useState([]);

  useEffect(() => {
    // Get similar cars (exclude current car)
    const otherCars = mockOffers.filter(car => car.id !== currentCarId);
    // Take first 3 cars as similar offers
    setSimilarCars(otherCars.slice(0, 3));
  }, [currentCarId]);

  const SimilarCarCard = ({ car }) => {
    const [fomoCounters, setFomoCounters] = useState({ viewers: 0, confirmed: 0 });

    useEffect(() => {
      const updateFOMO = () => {
        const counters = getFOMOCounters(car.id);
        setFomoCounters(counters);
      };

      updateFOMO();
      const interval = setInterval(updateFOMO, 90000 + Math.random() * 90000);
      return () => clearInterval(interval);
    }, [car.id]);

    const savingsPercentage = Math.round((car.savings / car.msrp) * 100);

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={car.image}
            alt={`${car.title} — similar offer`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          <Badge className="absolute top-4 left-4 bg-green-600 text-white">
            Fleet Deal
          </Badge>
          
          {/* FOMO Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-blue-600">
                  <Eye className="w-3 h-3" />
                  <span>{fomoCounters.viewers}</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>{fomoCounters.confirmed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-200">
            {car.title}
          </h3>

          {/* Pricing */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(car.msrp)}
              </span>
              <Badge className="bg-red-100 text-red-800 text-xs">
                -{savingsPercentage}%
              </Badge>
            </div>
            
            <div className="text-2xl font-bold text-red-600">
              {formatPrice(car.fleet)}
            </div>
            
            <div className="text-sm text-green-600 font-medium">
              Save: {formatPrice(car.savings)}
            </div>
          </div>

          {/* Key Features */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Car className="w-4 h-4" />
              <span>Left: {car.stockLeft} units</span>
            </div>
            
            <div className="text-sm text-orange-700 bg-orange-50 p-2 rounded-lg">
              No add-ons worth {formatPrice(car.addonsAvg)}
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            asChild
            className="w-full bg-gray-900 hover:bg-gray-800 text-white group-hover:bg-red-600 group-hover:hover:bg-red-700 transition-all duration-300"
          >
            <Link to={`/car/${car.id}`}>
              View Details
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  };

  if (similarCars.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Similar Offers
          </h2>
          <p className="text-lg text-gray-600">
            Other fleet deals that might interest you
          </p>
        </div>

        {/* Similar Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {similarCars.map((car) => (
            <SimilarCarCard key={car.id} car={car} />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center">
          <Button 
            asChild
            variant="outline"
            size="lg"
            className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-3"
          >
            <Link to="/">
              View All Offers
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SimilarOffers;