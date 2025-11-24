import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Clock, Eye, TrendingUp, AlertCircle } from 'lucide-react';
import CarHero from '../components/car-detail/CarHero';
import CarGallery from '../components/car-detail/CarGallery';
import CarSpecs from '../components/car-detail/CarSpecs';
import AutoBanditStyleCalculator from '../components/AutoBanditStyleCalculator';
import PriceTrendChart from '../components/PriceTrendChart';
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
  const [timeRemaining, setTimeRemaining] = useState({ days: 1, hours: 23, minutes: 45, seconds: 0 });
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    fetchCarData();
    
    // Sticky bar on scroll
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      
      {/* HERO - ПОЛНЫЙ ЭКРАН С LEXUS */}
      <div className="relative w-full h-screen min-h-[700px] bg-black">
        {/* Car Image - Full Screen */}
        <img
          src={carData.image || carData.gallery?.[0]}
          alt={carData.title}
          className="w-full h-full object-cover opacity-90"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-6 pb-16 w-full">
            
            {/* Top Badges */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                VERIFIED FLEET DEAL
              </div>
              <div className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold">
                🔥 SELLING FAST
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {carData.title}
            </h1>
            
            {/* Price Strip */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-lg">
                <div className="text-xs opacity-80">MSRP</div>
                <div className="text-2xl font-bold line-through">${carData.msrp?.toLocaleString()}</div>
              </div>
              
              <div className="text-4xl font-bold text-white">→</div>
              
              <div className="bg-green-600 text-white px-8 py-4 rounded-xl shadow-2xl">
                <div className="text-xs">YOU SAVE</div>
                <div className="text-3xl font-bold">${carData.savings?.toLocaleString()}</div>
              </div>
              
              <div className="text-4xl font-bold text-white">→</div>
              
              <div className="bg-white text-gray-900 px-8 py-4 rounded-xl shadow-2xl">
                <div className="text-xs text-gray-600">YOUR PRICE</div>
                <div className="text-3xl font-bold">${carData.fleet?.toLocaleString()}</div>
              </div>
              
              <div className="bg-red-600 text-white px-6 py-3 rounded-lg">
                <div className="text-xs">DISCOUNT</div>
                <div className="text-xl font-bold">{((carData.savings / carData.msrp) * 100).toFixed(1)}%</div>
              </div>
            </div>
            
            {/* CTA - КРУПНЫЙ */}
            <button className="bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-xl font-bold text-2xl shadow-2xl transform hover:scale-105 transition-transform">
              RESERVE FOR FREE →
            </button>
            
            <p className="text-sm text-white/80 mt-3">
              No payment now. Cancel anytime before final contract.
            </p>
          </div>
        </div>
        
        {/* Timer - Top Right */}
        <div className="absolute top-6 right-6 bg-red-600 text-white rounded-xl p-6 shadow-2xl">
          <div className="text-xs uppercase mb-2">DEAL ENDS IN</div>
          <div className="text-4xl font-bold">
            {timeRemaining.days}d {timeRemaining.hours}h
          </div>
          <div className="text-xs mt-2 opacity-80">
            {timeRemaining.minutes} minutes remaining
          </div>
        </div>
      </div>

      {/* Social Proof Bar - Under Image */}
      <div className="bg-blue-50 border-y border-blue-300 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span><strong>127 people</strong> viewing in last 24h</span>
            </div>
            <div className="h-4 w-px bg-blue-300"></div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span><strong>18 reserved</strong> today</span>
            </div>
            <div className="h-4 w-px bg-blue-300"></div>
            <div className="text-xs text-gray-500">Updated in real-time</div>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN: Calculator Left (2/3), Gallery Right (1/3) */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT - Calculator + Info (2/3) */}
          <div className="lg:col-span-2 space-y-6 relative z-10">
            
            <AutoBanditStyleCalculator car={carData} />
            
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


            {/* WHAT HAPPENS NEXT - Amazon Delivery Style */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">What Happens After You Reserve?</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <div className="font-semibold text-gray-900">Reserve Online (2 min)</div>
                    <div className="text-sm text-gray-600">No payment now. We hold the car and price for you.</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <div className="font-semibold text-gray-900">Soft Credit Check (24h)</div>
                    <div className="text-sm text-gray-600">No score impact. We confirm exact monthly payment for YOUR credit tier.</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <div className="font-semibold text-gray-900">Delivery (0-2 days)</div>
                    <div className="text-sm text-gray-600">E-sign contract, schedule pickup or free home delivery.</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                <p className="text-xs text-blue-900">
                  ✓ Cancel anytime before final contract. Full deposit refund if you change your mind.
                </p>
              </div>
            </div>

            {/* MINI FAQ - Amazon Q&A Style */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">Quick Answers</h3>
              <div className="space-y-3 text-sm">
                <details className="group">
                  <summary className="cursor-pointer font-semibold text-gray-900 flex justify-between items-center">
                    Why is this price so low?
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-gray-600">
                    Fleet pricing. Same rates rental companies pay for bulk orders. Dealer needs to move inventory fast - you get the savings.
                  </p>
                </details>
                
                <details className="group">
                  <summary className="cursor-pointer font-semibold text-gray-900 flex justify-between items-center">
                    Are there hidden fees?
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-gray-600">
                    No. Price includes CA taxes, DMV registration, doc fees. No dealer add-ons ($5,500 typical - we charge $0).
                  </p>
                </details>
                
                <details className="group">
                  <summary className="cursor-pointer font-semibold text-gray-900 flex justify-between items-center">
                    What if my credit score is lower?
                    <span className="group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-2 text-gray-600">
                    Still qualify! Lower scores (680-719) may have slightly higher monthly or more down payment. We work with Tier 1-6.
                  </p>
                </details>
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

            {/* Price Trend Chart */}
            <PriceTrendChart car={carData} />
          </div>
          
          {/* RIGHT - Gallery (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <CarGallery 
                images={carData.gallery?.slice(1) || []}
                title={carData.title}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* STICKY CTA BAR - Amazon/Walmart Style */}
      {showStickyBar && carData && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-2xl z-50 py-4">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={carData.image} alt="" className="w-16 h-16 object-cover rounded" />
              <div>
                <div className="font-bold text-gray-900">{carData.title}</div>
                <div className="text-sm text-gray-600">${carData.lease?.monthly || 577}/mo</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-600">Ends in</div>
                <div className="text-lg font-bold text-red-600">
                  {timeRemaining.days}d {timeRemaining.hours}h
                </div>
              </div>
              
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg">
                RESERVE NOW
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer hiddenVin={carData?.specs?.vin} />
      <FOMOTicker />
      
      {/* Add bottom padding for FOMO ticker */}
      <div className="h-16 lg:h-12" />
    </div>
  );
};

export default CarDetail;