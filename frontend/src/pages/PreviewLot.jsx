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
import { Badge } from '../components/ui/badge';
import { Eye, AlertTriangle } from 'lucide-react';

const PreviewLot = () => {
  const { token } = useParams();
  const [lotData, setLotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPreviewData();
  }, [token]);

  const fetchPreviewData = async () => {
    setLoading(true);
    try {
      // Mock preview data based on token
      const mockLot = {
        id: 'preview-lot',
        title: '2024 Honda Accord LX',
        msrp: 28900,
        fleet: 25800,
        savings: 3100,
        stockLeft: 1,
        image: "https://images.unsplash.com/photo-1614687153862-b0e115ebcef1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxuZXclMjBjYXJ8ZW58MHx8fHwxNzU3NDQxNzA1fDA&ixlib=rb-4.1.0&q=85",
        dealer: "City Honda, OC",
        endsAt: new Date(Date.now() + 52 * 60 * 60 * 1000),
        addonsAvg: 3445,
        lease: { 
          termMonths: 36, 
          milesPerYear: 10000, 
          dueAtSigning: 2800, 
          monthly: 310, 
          incentives: 1800 
        },
        finance: { 
          apr: 3.5, 
          termMonths: 60, 
          downPayment: 2500 
        },
        gallery: [
          "https://images.unsplash.com/photo-1614687153862-b0e115ebcef1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxuZXclMjBjYXJ8ZW58MHx8fHwxNzU3NDQxNzA1fDA&ixlib=rb-4.1.0&q=85",
          "https://images.unsplash.com/photo-1712885046114-5ea81a2f7555?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxjYXIlMjBzdHVkaW98ZW58MHx8fHwxNzU3NDQxNzE1fDA&ixlib=rb-4.1.0&q=85",
          "https://images.pexels.com/photos/720815/pexels-photo-720815.jpeg",
          "https://images.pexels.com/photos/244818/pexels-photo-244818.jpeg"
        ],
        specs: {
          year: '2024',
          make: 'Honda',
          model: 'Accord',
          trim: 'LX',
          engine: '1.5L Turbo I4',
          transmission: 'CVT',
          drivetrain: 'FWD',
          exteriorColor: 'Белый жемчуг',
          interiorColor: 'Чёрная кожа',
          vin: `1HGCV${Math.random().toString(36).substr(2, 12).toUpperCase()}`
        },
        isDrop: true, // Preview as drop item
        description: "Это предпросмотр лота в админ-панели. В реальном окружении здесь будет отображаться актуальная информация о лоте перед публикацией."
      };

      setLotData(mockLot);
    } catch (error) {
      console.error('Failed to fetch preview data:', error);
      setError('Не удалось загрузить данные предпросмотра');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем предпросмотр...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ошибка предпросмотра</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Возможно, токен предпросмотра истек или неверен</p>
        </div>
      </div>
    );
  }

  if (!lotData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Лот не найден</h1>
          <p className="text-gray-600">Предпросмотр недоступен</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Notice */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
          <Eye className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800 font-medium">
            Режим предпросмотра
          </span>
          <Badge className="bg-yellow-200 text-yellow-800">
            Не индексируется
          </Badge>
          <span className="text-yellow-700 text-sm">
            Эта страница видна только по прямой ссылке и не индексируется поисковыми системами
          </span>
        </div>
      </div>

      <Header />
      
      {/* Car Hero Section */}
      <CarHero car={lotData} />
      
      {/* Car Gallery */}
      <CarGallery images={lotData.gallery} title={lotData.title} />
      
      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Specs & Calculator */}
          <div className="lg:col-span-2 space-y-12">
            <CarSpecs car={lotData} />
            <OTDCalculator car={lotData} />
          </div>
          
          {/* Right Column - Forms */}
          <div className="space-y-8">
            <CarForms car={lotData} />
          </div>
        </div>
      </div>
      
      {/* Similar Offers */}
      <SimilarOffers currentCarId={lotData.id} />
      
      <Footer />
      <FOMOTicker />
      
      {/* Add bottom padding for FOMO ticker */}
      <div className="h-16 lg:h-12" />

      {/* Preview Watermark */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
          <Eye className="w-4 h-4 inline mr-2" />
          Предпросмотр
        </div>
      </div>
    </div>
  );
};

export default PreviewLot;