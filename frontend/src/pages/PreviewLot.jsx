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
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/preview/${token}`);
      
      if (response.ok) {
        const data = await response.json();
        setLotData(data);
        setError(null);
      } else if (response.status === 404) {
        setError('Preview not found or token expired');
      } else {
        setError('Failed to load preview');
      }
    } catch (error) {
      console.error('Failed to fetch preview data:', error);
      setError('Error loading preview data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Preview Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Preview token may have expired or is invalid</p>
        </div>
      </div>
    );
  }

  if (!lotData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lot Not Found</h1>
          <p className="text-gray-600">Preview unavailable</p>
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
            Preview Mode
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
          Preview
        </div>
      </div>
    </div>
  );
};

export default PreviewLot;