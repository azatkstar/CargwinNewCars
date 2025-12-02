import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FiltersSidebar from '../components/FiltersSidebar';
import OfferCard from '../components/OfferCard';
import { Helmet } from 'react-helmet-async';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
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
      setFilteredOffers(data);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);
    
    if (!filters) {
      setFilteredOffers(offers);
      return;
    }
    
    let result = offers.filter(offer => {
      // Brand filter
      if (filters.brand !== 'all' && !offer.title.toLowerCase().includes(filters.brand.toLowerCase())) {
        return false;
      }
      
      // Payment filter
      const monthly = offer.lease?.monthly || offer.finance?.monthly || 0;
      if (monthly < filters.budgetMin || monthly > filters.budgetMax) {
        return false;
      }
      
      // Deal type filter
      if (filters.dealType !== 'all') {
        if (filters.dealType === 'lease' && !offer.lease) return false;
        if (filters.dealType === 'finance' && !offer.finance) return false;
      }
      
      return true;
    });
    
    setFilteredOffers(result);
  };

  const handleClearFilters = () => {
    setActiveFilters(null);
    setFilteredOffers(offers);
  };

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
              onFilterChange={applyFilters}
              onClear={handleClearFilters}
            />
          </div>

          {/* Right - All Offers */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {filteredOffers.length} {filteredOffers.length === 1 ? 'offer' : 'offers'} available
              </p>
              {activeFilters && (
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
