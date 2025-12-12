import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FiltersSidebar from '../components/FiltersSidebar';
import OfferCard from '../components/OfferCard';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      if (!BACKEND_URL) {
        throw new Error('Backend URL not configured');
      }

      const response = await fetch(`${BACKEND_URL}/api/cars`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Ensure data is array
      const offersArray = Array.isArray(data) ? data : [];
      
      setOffers(offersArray);
      setFilteredOffers(offersArray);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
      setError(error.message);
      setOffers([]);
      setFilteredOffers([]);
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
    
    let result = Array.isArray(offers) ? offers : [];
    
    result = result.filter(offer => {
      // Brand filter
      if (filters.brand !== 'all' && !offer.title.toLowerCase().includes(filters.brand.toLowerCase())) {
        return false;
      }
      
      // Payment filter
      const monthly = (offer.lease && offer.lease.monthly) || (offer.finance && offer.finance.monthly) || 0;
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
        <title>Hunter.Lease – Best Lease Deals | Updated Monthly</title>
        <meta name="description" content="Exclusive lease and finance deals on all brands. Real prices. Updated monthly. No hidden fees." />
        <meta name="keywords" content="car lease deals, California lease specials, best lease rates, fleet pricing, Honda lease, Toyota lease, BMW lease" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Hunter.Lease – Best Lease Deals" />
        <meta property="og:description" content="Exclusive dump offers updated monthly" />
        <meta property="og:url" content="https://hunter.lease/deals" />
        <meta property="og:type" content="website" />
        
        {/* Schema.org ProductCollection */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProductCollection",
            "name": "Lease Deals",
            "url": "https://hunter.lease/deals",
            "description": "Exclusive dump offers updated monthly"
          })}
        </script>
      </Helmet>
      
      <Header />
      
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <nav className="flex text-sm text-gray-600" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2">
            <li>
              <a href="/" className="hover:text-red-600">Home</a>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">Deals</span>
            </li>
          </ol>
        </nav>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-9">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
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
