import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '../components/ui/card';
import CarHero from '../components/car-detail/CarHero';
import CarGallery from '../components/car-detail/CarGallery';
import CarSpecs from '../components/car-detail/CarSpecs';
import AutoBanditStyleCalculator from '../components/AutoBanditStyleCalculator';
import CarForms from '../components/car-detail/CarForms';
import SimilarOffers from '../components/car-detail/SimilarOffers';
import PriceComparison from '../components/car-detail/PriceComparison';
import LeaseVsFinanceComparison from '../components/LeaseVsFinanceComparison';
import VideoGallery from '../components/VideoGallery';
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
      
      {/* Car Title + Basic Info - как у AutoBandit */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {carData.title || 'Loading...'}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>MSRP ${carData.msrp?.toLocaleString()}</span>
            <span>•</span>
            <span className="text-green-600 font-semibold">
              {((carData.savings / carData.msrp) * 100).toFixed(1)}% off MSRP
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - ТОЧНО КАК AUTOBANDIT */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN - Calculator (КАК У AUTOBANDIT) */}
          <div className="lg:col-span-1">
            <AutoBanditStyleCalculator car={carData} />
          </div>

          {/* RIGHT COLUMN - Info & Gallery */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Car Image */}
            <div className="relative">
              <img
                src={carData.image || carData.gallery?.[0]}
                alt={carData.title}
                className="w-full rounded-xl"
              />
              <div className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
                ✓ VERIFIED FLEET DEAL
              </div>
            </div>

            {/* SAVINGS HIGHLIGHT */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-600 rounded-xl p-6">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-sm text-gray-600 mb-1">MSRP</div>
                  <div className="text-2xl font-bold line-through text-gray-400">
                    ${carData.msrp?.toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">YOU SAVE</div>
                  <div className="text-4xl font-bold text-green-600 border-4 border-red-600 rounded-lg px-6 py-3 bg-white">
                    ${carData.savings?.toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">YOUR PRICE</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${carData.fleet?.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* DEAL INSIGHTS - как у AutoBandit */}
            <Card>
              <CardHeader>
                <CardTitle>DEAL INSIGHTS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">MSRP</span>
                  <span className="font-bold">${carData.msrp?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">DISCOUNT</span>
                  <span className="font-bold text-green-600">
                    ${carData.savings?.toLocaleString()} ({((carData.savings / carData.msrp) * 100).toFixed(2)}%)
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">SELLING PRICE</span>
                  <span className="font-bold text-xl">${carData.fleet?.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* SPECS - как у AutoBandit */}
            <Card>
              <CardHeader>
                <CardTitle>Specs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year</span>
                    <span className="font-medium">{carData.specs?.year || carData.title?.split(' ')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Model</span>
                    <span className="font-medium">{carData.specs?.model || carData.title?.split(' ')[1]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trim</span>
                    <span className="font-medium">{carData.specs?.trim || 'Base'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Miles</span>
                    <span className="font-medium">0 mi (new)</span>
                  </div>
                  <div className="flex justify-between col-span-2 border-t pt-3">
                    <span className="text-gray-600">MSRP</span>
                    <span className="font-bold">${carData.msrp?.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* hunter.lease PHILOSOPHY */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">Why hunter.lease?</h3>
              <div className="space-y-2 text-sm">
                <p className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Fleet Pricing:</strong> Same prices rental companies pay</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>No Dealer Add-ons:</strong> They charge ${carData.dealer_addons?.toLocaleString() || '5,500'} - we charge $0</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>100% Online:</strong> No dealer visits, no haggling, no BS</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>All Credit Tiers:</strong> 680+ welcome, we work with you</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer hiddenVin={carData?.specs?.vin} />
      <FOMOTicker />
      
      {/* Add bottom padding for FOMO ticker */}
      <div className="h-16 lg:h-12" />
    </div>
  );
};

export default CarDetail;