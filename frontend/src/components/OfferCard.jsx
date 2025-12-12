import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart } from 'lucide-react';

const OfferCard = ({ offer }) => {
  const [isSaved, setIsSaved] = React.useState(false);

  // Extract data
  const title = offer.title || `${offer.year || ''} ${offer.make || ''} ${offer.model || ''}`.trim();
  const payment = offer.monthlyPayment || offer.lease?.monthly || offer.finance?.monthly || 0;
  const dealType = offer.dealType || (offer.lease ? 'Lease' : offer.finance ? 'Finance' : 'Cash');
  const term = offer.termMonths || offer.lease?.termMonths || offer.finance?.termMonths || 0;
  const miles = offer.mileage || offer.lease?.milesPerYear || 0;
  const savings = offer.discount || offer.savings || 0;
  
  // CANONICAL ID - use MongoDB _id or offer.id
  const offerId = offer.id || offer._id || '';
  
  const toggleSaved = (e) => {
    e.preventDefault();
    const saved = JSON.parse(localStorage.getItem('hunter_saved_cars') || '[]');
    
    if (isSaved) {
      const updated = saved.filter(id => id !== offer.id);
      localStorage.setItem('hunter_saved_cars', JSON.stringify(updated));
      setIsSaved(false);
    } else {
      saved.push(offer.id);
      localStorage.setItem('hunter_saved_cars', JSON.stringify(saved));
      setIsSaved(true);
    }
  };

  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('hunter_saved_cars') || '[]');
    setIsSaved(saved.includes(offer.id));
  }, [offer.id]);

  return (
    <Link to={`/car/${slug}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow duration-200 overflow-hidden cursor-pointer h-full">
        {/* Image */}
        <div className="h-40 sm:h-48 bg-gray-200 overflow-hidden">
          <img
            src={offer.image || 'https://via.placeholder.com/400x300'}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Content - Compact */}
        <div className="p-3 sm:p-4">
          {/* Title */}
          <h3 className="font-bold text-base sm:text-lg mb-1 line-clamp-1">
            {title}
          </h3>

          {/* Deal Type + Term */}
          <div className="flex gap-2 mb-2 text-xs">
            <Badge variant="secondary" className="text-xs">{dealType}</Badge>
            {term > 0 && <span className="text-gray-600">{term}mo</span>}
            {miles > 0 && <span className="text-gray-600">• {(miles / 1000).toFixed(1)}k mi/yr</span>}
          </div>

          {/* Payment - Bold */}
          <div className="mb-2">
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              ${payment.toFixed(0)}
              <span className="text-xs sm:text-sm text-gray-600 font-normal">/mo</span>
            </div>
          </div>

          {/* Savings */}
          {savings > 0 && (
            <div className="mb-3">
              <Badge className="bg-green-100 text-green-700 text-xs">
                Save ${savings.toLocaleString()}
              </Badge>
            </div>
          )}

          {/* FOMO */}
          {stockLeft && stockLeft <= 3 && (
            <div className="text-xs text-orange-600 mb-3">
              🔥 Only {stockLeft} left
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-2">
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-sm py-2">
              View Deal
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSaved}
              className="text-sm"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default OfferCard;
