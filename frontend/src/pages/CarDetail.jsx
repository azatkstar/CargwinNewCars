import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, TrendingUp, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FOMOTicker from '../components/FOMOTicker';
import TalkToSpecialist from '../components/TalkToSpecialist';
import AutoBanditStyleCalculator from '../components/AutoBanditStyleCalculator';
import FullscreenGalleryModal from '../components/hunter-redesign/FullscreenGalleryModal';
import WhyThisPriceBlock from '../components/hunter-redesign/WhyThisPriceBlock';
import ReservationStepsCards from '../components/hunter-redesign/ReservationStepsCards';
import QuickAnswersAccordion from '../components/hunter-redesign/QuickAnswersAccordion';
import DealInsightsMinimal from '../components/hunter-redesign/DealInsightsMinimal';
import SpecsWithFeatures from '../components/hunter-redesign/SpecsWithFeatures';
import WhyHunterLeaseCards from '../components/hunter-redesign/WhyHunterLeaseCards';
import PaymentTrendSimple from '../components/hunter-redesign/PaymentTrendSimple';
import DealerVsOurPriceBig from '../components/hunter-redesign/DealerVsOurPriceBig';
import CustomerStoriesAmazon from '../components/hunter-redesign/CustomerStoriesAmazon';
import BottomCTABlock from '../components/hunter-redesign/BottomCTABlock';
import { mockOffers } from '../mock';
import { useI18n } from '../hooks/useI18n';

const CarDetail = () => {
  const { t } = useI18n();
  const { carId } = useParams();
  const [carData, setCarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({ days: 1, hours: 23, minutes: 45, seconds: 0 });
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

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

  // Prepare all images for gallery
  const allGalleryImages = carData.gallery || [carData.image];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{carData.title} - Fleet Pricing | hunter.lease</title>
        <meta name="description" content={`Fleet-level pricing on ${carData.title}. MSRP $${carData.msrp?.toLocaleString()}, You Save $${carData.savings?.toLocaleString()}. Transparent online leasing.`} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${carData.title} - Fleet Pricing`} />
        <meta property="og:image" content={carData.image || carData.gallery?.[0]} />
      </Helmet>
      
      <Header />
      
      {/* ============================================ */}
      {/* HERO BLOCK - FULL SCREEN */}
      {/* ============================================ */}
      <div className="relative w-full h-screen min-h-[700px] bg-black">
        <img
          src={carData.image || carData.gallery?.[0]}
          alt={carData.title}
          className="w-full h-full object-cover opacity-90"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-6 pb-16 w-full">
            
            {/* Badge */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg font-bold shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                Verified Fleet Deal
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              {carData.title}
            </h1>
            
            {/* Price Flow - SIMPLIFIED */}
            <div className="flex flex-wrap items-center gap-3 mb-6 text-white">
              <div>
                <div className="text-sm opacity-70">MSRP</div>
                <div className="text-2xl font-bold line-through opacity-80">${carData.msrp?.toLocaleString()}</div>
              </div>
              
              <div className="text-3xl">→</div>
              
              <div className="bg-green-600 px-6 py-3 rounded-xl">
                <div className="text-xs">YOU SAVE</div>
                <div className="text-3xl font-bold">${carData.savings?.toLocaleString()}</div>
              </div>
              
              <div className="text-3xl">→</div>
              
              <div className="bg-white text-gray-900 px-8 py-4 rounded-xl shadow-2xl">
                <div className="text-xs text-gray-600">YOUR PRICE</div>
                <div className="text-4xl font-bold">${carData.fleet?.toLocaleString()}</div>
              </div>
            </div>
            
            {/* Estimated Payment */}
            <div className="text-white mb-6">
              <div className="text-3xl font-bold">
                Estimated Payment: ${carData.lease?.monthly || 310}/mo
              </div>
              <div className="text-sm opacity-70">(700+ credit, 36 mo, 10k mi)</div>
            </div>
            
            {/* FOMO Line - ONE ROW */}
            <div className="flex items-center gap-6 text-white mb-8 text-sm">
              <div className="flex items-center gap-2">
                🔥 <strong>127</strong> people viewed today
              </div>
              <div>•</div>
              <div className="flex items-center gap-2">
                💥 <strong>18</strong> reservations in last 24h
              </div>
              <div>•</div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>⏳ Deal ends in <strong>{timeRemaining.days}d {timeRemaining.hours}h</strong></span>
              </div>
            </div>
            
            {/* CTA - HUGE */}
            <button 
              onClick={() => {/* Open reserve modal */}}
              className="bg-red-600 hover:bg-red-700 text-white px-16 py-6 rounded-xl font-bold text-3xl shadow-2xl transform hover:scale-105 transition-all mb-3"
            >
              RESERVE FOR FREE
            </button>
            
            <p className="text-sm text-white/80">
              Takes 30 seconds. No payment today. Cancel anytime.
            </p>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* TWO-COLUMN LAYOUT */}
      {/* ============================================ */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Photo Gallery - Clickable to fullscreen */}
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
              <div className="relative">
                <img
                  src={allGalleryImages[0]}
                  alt={carData.title}
                  className="w-full h-[500px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    setGalleryStartIndex(0);
                    setShowGalleryModal(true);
                  }}
                />
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                  Click to view all photos
                </div>
              </div>
              
              {/* Thumbnails */}
              <div className="p-4 flex gap-2 overflow-x-auto">
                {allGalleryImages.slice(1, 6).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setGalleryStartIndex(idx + 1);
                      setShowGalleryModal(true);
                    }}
                    className="flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 border-gray-300 hover:border-red-600 transition-colors"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Why This Price */}
            <WhyThisPriceBlock />
            
            {/* What Happens After Reserve */}
            <ReservationStepsCards />
            
            {/* Quick Answers */}
            <QuickAnswersAccordion />
            
            {/* Deal Insights - MINIMAL (3 lines only) */}
            <DealInsightsMinimal 
              msrp={carData.msrp}
              discount={carData.savings}
              finalPrice={carData.fleet}
            />
            
            {/* Specs with Features */}
            <SpecsWithFeatures car={carData} />
            
            {/* Why Hunter.Lease - 4 CARDS */}
            <WhyHunterLeaseCards />
            
            {/* Payment Trend - SIMPLIFIED */}
            <PaymentTrendSimple monthlyPayment={carData.lease?.monthly || 310} />
            
            {/* Dealer vs Our Price - BIG GREEN */}
            <DealerVsOurPriceBig 
              msrp={carData.msrp}
              ourPrice={carData.fleet}
              savings={carData.savings}
            />
            
            {/* Customer Stories - Amazon Style */}
            <CustomerStoriesAmazon />
          </div>
          
          {/* RIGHT COLUMN (1/3) - STICKY CALCULATOR */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <AutoBanditStyleCalculator car={carData} />
            </div>
          </div>
        </div>
      </div>
      
      {/* ============================================ */}
      {/* BOTTOM CTA BLOCK */}
      {/* ============================================ */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <BottomCTABlock 
          car={carData}
          timeRemaining={timeRemaining}
          onReserve={() => {/* Open reserve modal */}}
        />
      </div>
      
      {/* STICKY BOTTOM BAR - On Scroll */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-2xl z-50 py-4">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={carData.image} alt="" className="w-16 h-16 object-cover rounded" />
              <div>
                <div className="font-bold text-gray-900">{carData.title}</div>
                <div className="text-sm text-gray-600">${carData.lease?.monthly || 310}/mo</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-xs text-gray-600">Deal ends in</div>
                <div className="text-lg font-bold text-red-600">
                  {timeRemaining.days}d {timeRemaining.hours}h
                </div>
              </div>
              
              <button 
                onClick={() => {/* Open reserve modal */}}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg"
              >
                RESERVE NOW
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Fullscreen Gallery Modal */}
      {showGalleryModal && (
        <FullscreenGalleryModal
          images={allGalleryImages}
          initialIndex={galleryStartIndex}
          onClose={() => setShowGalleryModal(false)}
        />
      )}
      
      <TalkToSpecialist />
      <Footer hiddenVin={carData?.specs?.vin} />
      <FOMOTicker />
      
      <div className="h-16 lg:h-12" />
    </div>
  );
};

export default CarDetail;