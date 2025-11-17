import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import CarHero from '../components/car-detail/CarHero';
import CarGallery from '../components/car-detail/CarGallery';
import CarSpecs from '../components/car-detail/CarSpecs';
import AutoBanditStyleCalculator from '../components/AutoBanditStyleCalculator';
import CarForms from '../components/car-detail/CarForms';
import SimilarOffers from '../components/car-detail/SimilarOffers';
import PriceComparison from '../components/car-detail/PriceComparison';
import LeaseVsFinanceComparison from '../components/LeaseVsFinanceComparison';
import AlternativeVehicles from '../components/AlternativeVehicles';
import ModelSubscriptions from '../components/ModelSubscriptions';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FOMOTicker from '../components/FOMOTicker';
import { mockOffers } from '../mock';
import { useI18n } from '../hooks/useI18n';

const CarDetail = () => {
  const { t } = useI18n();
  const { carId } = useParams();
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarData();
  }, [carId]);

  const fetchCarData = async () => {
    setLoading(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/cars/${carId}`);
      
      if (response.ok) {
        const data = await response.json();
        setCarData(data);
      } else if (response.status === 404) {
        // Car not found in backend, show error or redirect
        console.error('Car not found:', carId);
        setCarData(null);
      } else {
        console.error('Failed to fetch car data:', response.status);
        // Fallback to mock data as last resort
        const car = mockOffers.find(offer => offer.id === carId);
        if (car) {
          const enhancedCar = {
            ...car,
            gallery: [
              car.image,
              "https://images.unsplash.com/photo-1712885046114-5ea81a2f7555?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxjYXIlMjBzdHVkaW98ZW58MHx8fHwxNzU3NDQxNzE1fDA&ixlib=rb-4.1.0&q=85",
              "https://images.pexels.com/photos/720815/pexels-photo-720815.jpeg",
              "https://images.pexels.com/photos/244818/pexels-photo-244818.jpeg"
            ],
            specs: {
              year: car.title.split(' ')[0],
              make: car.title.split(' ')[1],
              model: car.title.split(' ')[2] + (car.title.split(' ')[3] || ''),
              trim: car.title.split(' ').slice(3).join(' ') || 'Base',
              engine: car.id.includes('niro') ? '1.6L Hybrid' : car.id.includes('tacoma') ? '2.4L Turbo I4' : '1.5L Turbo I4',
              transmission: 'CVT',
              drivetrain: car.id.includes('tacoma') ? 'RWD' : 'FWD',
              exteriorColor: 'Белый жемчуг',
              interiorColor: 'Чёрная кожа',
              vin: `1HGCV${Math.random().toString(36).substr(2, 12).toUpperCase()}`
            },
            isDrop: Math.random() > 0.5
          };
          setCarData(enhancedCar);
        }
      }
    } catch (error) {
      console.error('Failed to fetch car data:', error);
      // Final fallback to mock data
      const car = mockOffers.find(offer => offer.id === carId);
      if (car) {
        const enhancedCar = {
          ...car,
          gallery: [
            car.image,
            "https://images.unsplash.com/photo-1712885046114-5ea81a2f7555?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxjYXIlMjBzdHVkaW98ZW58MHx8fHwxNzU3NDQxNzE1fDA&ixlib=rb-4.1.0&q=85",
            "https://images.pexels.com/photos/720815/pexels-photo-720815.jpeg",
            "https://images.pexels.com/photos/244818/pexels-photo-244818.jpeg"
          ],
          specs: {
            year: car.title.split(' ')[0],
            make: car.title.split(' ')[1],
            model: car.title.split(' ')[2] + (car.title.split(' ')[3] || ''),
            trim: car.title.split(' ').slice(3).join(' ') || 'Base',
            engine: car.id.includes('niro') ? '1.6L Hybrid' : car.id.includes('tacoma') ? '2.4L Turbo I4' : '1.5L Turbo I4',
            transmission: 'CVT',
            drivetrain: car.id.includes('tacoma') ? 'RWD' : 'FWD',
            exteriorColor: 'Белый жемчуг',
            interiorColor: 'Чёрная кожа',
            vin: `1HGCV${Math.random().toString(36).substr(2, 12).toUpperCase()}`
          },
          isDrop: Math.random() > 0.5
        };
        setCarData(enhancedCar);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (!carData) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('car_detail.car_not_found')}</h1>
            <p className="text-gray-600">{t('car_detail.offer_unavailable')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{carData.title} - Exclusive Fleet Pricing | CargwinNewCar</title>
        <meta name="description" content={`Get exclusive fleet pricing on ${carData.title}. MSRP $${carData.msrp?.toLocaleString()}, Fleet Price $${carData.fleet?.toLocaleString()}. Save $${carData.savings?.toLocaleString()} with transparent pricing.`} />
        
        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${carData.title} - Fleet Pricing`} />
        <meta property="og:description" content={`Save $${carData.savings?.toLocaleString()} on ${carData.title}. Starting at $${carData.lease?.monthly}/month.`} />
        <meta property="og:image" content={carData.image || carData.gallery?.[0]} />
        <meta property="og:price:amount" content={carData.fleet} />
        <meta property="og:price:currency" content="USD" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${carData.title} - Fleet Pricing`} />
        <meta name="twitter:description" content={`Save $${carData.savings?.toLocaleString()}. Starting at $${carData.lease?.monthly}/month.`} />
        <meta name="twitter:image" content={carData.image || carData.gallery?.[0]} />
        
        {/* JSON-LD Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": carData.title,
            "image": carData.image || carData.gallery?.[0],
            "description": `${carData.title} available for lease at hunter.lease. Save $${carData.savings?.toLocaleString()} off MSRP.`,
            "brand": {
              "@type": "Brand",
              "name": carData.title?.split(' ')[1] || "Vehicle"
            },
            "offers": {
              "@type": "Offer",
              "url": window.location.href,
              "priceCurrency": "USD",
              "price": carData.lease?.monthly,
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": carData.lease?.monthly,
                "priceCurrency": "USD",
                "unitText": "MONTH"
              },
              "availability": "https://schema.org/InStock",
              "seller": {
                "@type": "Organization",
                "name": "hunter.lease"
              }
            }
          })}
        </script>
      </Helmet>
      
      <Header />
      
      {/* Car Hero Section */}
      <CarHero car={carData} />
      
      {/* BUILD YOUR LEASE - Top Priority (как AutoBandit) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Placeholder for main content */}
          </div>
          <div>
            <BuildYourLeaseCalculator car={carData} />
          </div>
        </div>
      </div>
      
      {/* Car Gallery */}
      <CarGallery images={carData.gallery} title={carData.title} />
      
      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Specs & Info */}
          <div className="lg:col-span-2 space-y-12">
            <CarSpecs car={carData} />
            
            {/* Price Comparison - Only show if competitor data exists */}
            <PriceComparison car={carData} />
            
            {/* Who This Offer Is For */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                ✓ Who This Offer Is For
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <div>
                    <strong>California Residents Only</strong>
                    <p className="text-sm text-gray-600">Must have valid CA address and CA driver's license</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <div>
                    <strong>Credit Score 720+ (Tier 1)</strong>
                    <p className="text-sm text-gray-600">Lower scores may qualify with higher rate or more down payment</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <div>
                    <strong>Annual Income $60K+ Recommended</strong>
                    <p className="text-sm text-gray-600">Based on typical approval for this payment range</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <div>
                    <strong>Valid Driver's License & Insurance</strong>
                    <p className="text-sm text-gray-600">Required before delivery - bring proof of insurance</p>
                  </div>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-300">
                <p className="text-xs text-yellow-900">
                  <strong>Note:</strong> If you don't meet all requirements, we can often find alternative vehicles 
                  that fit your profile. Contact us for options.
                </p>
              </div>
            </div>
            
            {/* Lease vs Finance Comparison */}
            <LeaseVsFinanceComparison car={carData} />
            
            {/* Alternative Vehicles - auto-suggested */}
            <AlternativeVehicles selectedCar={carData} />
          </div>
          
          {/* Right Column - Forms Only */}
          <div className="space-y-8">
            <CarForms car={carData} />
            <ModelSubscriptions carMake={carData.specs?.make || carData.make} carModel={carData.specs?.model || carData.model} />
          </div>
        </div>
      </div>
      
      {/* Similar Offers */}
      <SimilarOffers currentCarId={carId} />
      
      <Footer hiddenVin={carData?.specs?.vin} />
      <FOMOTicker />
      
      {/* Add bottom padding for FOMO ticker */}
      <div className="h-16 lg:h-12" />
    </div>
  );
};

export default CarDetail;