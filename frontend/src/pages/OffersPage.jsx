import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FiltersSidebar from '../components/FiltersSidebar';
import OfferCard from '../components/OfferCard';
import { Helmet } from 'react-helmet-async';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/cars`);
      const data = await response.json();
      setOffers(data);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (offersList) => {
    if (!activeFilters) return offersList;
    
    return offersList.filter(offer => {
      if (activeFilters.brand !== 'all' && !offer.title.toLowerCase().includes(activeFilters.brand)) {
        return false;
      }
      const monthly = offer.lease?.monthly || 0;
      if (monthly < activeFilters.budgetMin || monthly > activeFilters.budgetMax) {
        return false;
      }
      return true;
    });
  };

  const filteredOffers = applyFilters(offers);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>New Car Lease Deals California | Fleet Pricing - hunter.lease</title>
        <meta name="description" content="Browse all current car lease deals in California with fleet pricing. Save $5K-$15K on new Toyota, Lexus, Honda, BMW. Real prices, no haggling. Updated monthly." />
        <meta name="keywords" content="car lease deals, California lease, fleet pricing, new car deals, Toyota lease, Lexus lease, BMW lease" />
        <link rel="canonical" href="https://cargwin-newcar.emergent.host/offers" />
        
        {/* Open Graph */}
        <meta property="og:title" content="All Car Lease Deals - hunter.lease" />
        <meta property="og:description" content="Complete inventory of new car lease deals with fleet pricing. Save thousands on Toyota, Lexus, Honda, BMW and more." />
        <meta property="og:url" content="https://cargwin-newcar.emergent.host/offers" />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            All Current Dump Offers
          </h1>
          <p className="text-xl text-gray-600">
            Complete inventory. Real prices. Updated monthly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left - Filters */}
          <div className="lg:col-span-1">
            <FiltersSidebar 
              onFilterChange={setActiveFilters}
              onClear={() => setActiveFilters(null)}
            />
          </div>

          {/* Right - All Offers */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                {filteredOffers.length} {filteredOffers.length === 1 ? 'offer' : 'offers'} available
              </p>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : filteredOffers.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">No offers match your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOffers.map(offer => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OffersPage;
