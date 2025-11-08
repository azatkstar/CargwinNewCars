import React from 'react';
import { Shield, DollarSign, Clock, Lock, RotateCcw, Headphones, CheckCircle } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

const TrustManifest = () => {
  const { t } = useI18n();
  
  const trustPoints = [
    {
      icon: CheckCircle,
      title: t('trust.point1_title'),
      description: t('trust.point1_description'),
      highlight: t('trust.point1_highlight')
    },
    {
      icon: DollarSign,
      title: t('trust.point2_title'),
      description: t('trust.point2_description'),
      highlight: t('trust.point2_highlight')
    },
    {
      icon: Clock,
      title: t('trust.point3_title'),
      description: t('trust.point3_description'),
      highlight: t('trust.point3_highlight')
    },
    {
      icon: Lock,
      title: t('trust.point4_title'),
      description: t('trust.point4_description'),
      highlight: t('trust.point4_highlight')
    },
    {
      icon: RotateCcw,
      title: t('trust.point5_title'),
      description: t('trust.point5_description'),
      highlight: t('trust.point5_highlight')
    },
    {
      icon: Headphones,
      title: t('trust.point6_title'),
      description: t('trust.point6_description'),
      highlight: t('trust.point6_highlight')
    }
  ];

  return (
    <section id="trust" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-green-200">
            <Shield className="w-4 h-4" />
            {t('trust.badge')}
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('trust.title')}
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('trust.subtitle')}
          </p>
        </div>

        {/* Trust Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {trustPoints.map((point, index) => {
            const IconComponent = point.icon;
            
            return (
              <div 
                key={index}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-green-200 group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-700 transition-colors duration-300">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-sm">
                        {point.title}
                      </h3>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                        {point.highlight}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Key Stats */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">
                {t('trust.stat1_number')}
              </div>
              <div className="text-sm text-gray-600">
                {t('trust.stat1_description')}
              </div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {t('trust.stat2_number')}
              </div>
              <div className="text-sm text-gray-600">
                {t('trust.stat2_description')}
              </div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {t('trust.stat3_number')}
              </div>
              <div className="text-sm text-gray-600">
                {t('trust.stat3_description')}
              </div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {t('trust.stat4_number')}
              </div>
              <div className="text-sm text-gray-600">
                {t('trust.stat4_description')}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Commitment */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Lock className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">
                {t('trust.privacy_title')}
              </h3>
              <p className="text-blue-800 leading-relaxed">
                <strong>{t('trust.privacy_description')}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustManifest;