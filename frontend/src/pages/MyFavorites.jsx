import React, { useState, useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import OfferCard from '../components/OfferCard';

const MyFavorites = () => {
  const [savedCars, setSavedCars] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedCars();
  }, []);

  const fetchSavedCars = async () => {
    try {
      // Get saved IDs from localStorage
      const savedIds = JSON.parse(localStorage.getItem('hunter_saved_cars') || '[]');
      setSavedCars(savedIds);

      // Fetch all cars
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
      const endpoint = BACKEND_URL.endsWith('/api')
        ? `${BACKEND_URL}/cars`
        : `${BACKEND_URL}/api/cars`;

      const response = await fetch(endpoint);
      const allCars = await response.json();

      // Filter только saved
      const favorites = allCars.filter(car => savedIds.includes(car.id));
      setCars(favorites);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    if (confirm('Remove all favorites?')) {
      localStorage.setItem('hunter_saved_cars', '[]');
      setSavedCars([]);
      setCars([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              <Heart className="w-8 h-8 inline text-red-600 mr-2" />
              My Favorites
            </h1>
            <p className="text-gray-600">
              {cars.length} {cars.length === 1 ? 'car' : 'cars'} saved for comparison
            </p>
          </div>
          
          {cars.length > 0 && (
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:underline flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6">
              Click the heart icon on any car to save it here for easy comparison
            </p>
            <Link to="/offers">
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold">
                Browse All Offers
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cars.map(car => (
                <OfferCard key={car.id} offer={car} />
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/offers">
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold">
                  Browse More Offers
                </button>
              </Link>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyFavorites;
