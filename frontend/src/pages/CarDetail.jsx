import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CarHero from '../components/car-detail/CarHero';
import CarGallery from '../components/car-detail/CarGallery';
import CarSpecs from '../components/car-detail/CarSpecs';
import OTDCalculator from '../components/car-detail/OTDCalculator';
import CarForms from '../components/car-detail/CarForms';
import SimilarOffers from '../components/car-detail/SimilarOffers';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FOMOTicker from '../components/FOMOTicker';
import { mockOffers } from '../mock';

const CarDetail = () => {
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
      <Header />
      
      {/* Car Hero Section */}
      <CarHero car={carData} />
      
      {/* Car Gallery */}
      <CarGallery images={carData.gallery} title={carData.title} />
      
      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Specs & Calculator */}
          <div className="lg:col-span-2 space-y-12">
            <CarSpecs car={carData} />
            <OTDCalculator car={carData} />
          </div>
          
          {/* Right Column - Forms */}
          <div className="space-y-8">
            <CarForms car={carData} />
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