import React from 'react';
import { Badge } from './ui/badge';
import { MapPin, CheckCircle } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

const CoverageMap = () => {
  const { t } = useI18n();
  
  const coverageAreas = [
    { name: 'LA County', status: 'full', color: '#16a34a' }, // Зеленый для работающих зон
    { name: 'Orange County', status: 'full', color: '#16a34a' },
    { name: 'South Bay', status: 'full', color: '#16a34a' },
    { name: 'Ventura County', status: 'partial', color: '#f59e0b' },
    { name: 'Inland Empire', status: 'negotiable', color: '#6b7280' }
  ];

  return (
    <section id="coverage" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('coverage.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('coverage.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* SVG Map */}
          <div className="order-2 lg:order-1">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <svg
                viewBox="0 0 400 400"
                className="w-full h-auto max-w-md mx-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* LA County */}
                <path
                  d="M50 100 L200 80 L220 150 L180 200 L100 220 L40 180 Z"
                  fill="#16a34a"
                  fillOpacity="0.8"
                  stroke="#16a34a"
                  strokeWidth="2"
                  className="hover:fillOpacity-100 transition-all cursor-pointer"
                />
                <text x="120" y="150" textAnchor="middle" className="text-sm font-semibold fill-white">
                  LA County
                </text>

                {/* Orange County */}
                <path
                  d="M180 200 L220 150 L280 180 L260 250 L200 270 Z"
                  fill="#16a34a"
                  fillOpacity="0.8"
                  stroke="#16a34a"
                  strokeWidth="2"
                  className="hover:fillOpacity-100 transition-all cursor-pointer"
                />
                <text x="230" y="220" textAnchor="middle" className="text-sm font-semibold fill-white">
                  Orange
                </text>

                {/* South Bay */}
                <path
                  d="M100 220 L180 200 L200 270 L120 290 L80 250 Z"
                  fill="#16a34a"
                  fillOpacity="0.8"
                  stroke="#16a34a"
                  strokeWidth="2"
                  className="hover:fillOpacity-100 transition-all cursor-pointer"
                />
                <text x="140" y="250" textAnchor="middle" className="text-sm font-semibold fill-white">
                  South Bay
                </text>

                {/* Ventura County */}
                <path
                  d="M50 100 L40 180 L20 120 L30 60 L80 50 Z"
                  fill="#f59e0b"
                  fillOpacity="0.6"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  className="hover:fillOpacity-80 transition-all cursor-pointer"
                />
                <text x="40" y="110" textAnchor="middle" className="text-xs font-semibold fill-gray-700">
                  Ventura
                </text>

                {/* Inland Empire */}
                <path
                  d="M220 150 L300 120 L320 180 L280 180 Z"
                  fill="#6b7280"
                  fillOpacity="0.4"
                  stroke="#6b7280"
                  strokeWidth="2"
                  className="hover:fillOpacity-60 transition-all cursor-pointer"
                />
                <text x="270" y="150" textAnchor="middle" className="text-xs font-semibold fill-gray-600">
                  Inland Empire
                </text>

                {/* Major Cities */}
                <circle cx="120" cy="150" r="3" fill="white" stroke="#16a34a" strokeWidth="2" />
                <text x="120" y="140" textAnchor="middle" className="text-xs font-medium fill-gray-900">
                  LA
                </text>

                <circle cx="230" cy="220" r="3" fill="white" stroke="#16a34a" strokeWidth="2" />
                <text x="230" y="210" textAnchor="middle" className="text-xs font-medium fill-gray-900">
                  Anaheim
                </text>

                <circle cx="140" cy="250" r="3" fill="white" stroke="#16a34a" strokeWidth="2" />
                <text x="140" y="240" textAnchor="middle" className="text-xs font-medium fill-gray-900">
                  Long Beach
                </text>
              </svg>
            </div>
          </div>

          {/* Coverage Legend */}
          <div className="order-1 lg:order-2">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t('coverage.service_areas')}
              </h3>
              
              {coverageAreas.map((area) => (
                <div key={area.name} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0">
                    <div 
                      className="w-4 h-4 rounded-full border-2"
                      style={{ 
                        backgroundColor: area.color,
                        borderColor: area.color,
                        opacity: area.status === 'full' ? 1 : area.status === 'partial' ? 0.7 : 0.4
                      }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{area.name}</span>
                      {area.status === 'full' && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {t('coverage.full_coverage')}
                        </Badge>
                      )}
                      {area.status === 'partial' && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {t('coverage.partial')}
                        </Badge>
                      )}
                      {area.status === 'negotiable' && (
                        <Badge className="bg-gray-100 text-gray-800 text-xs">
                          {t('coverage.by_request')}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mt-1">
                      {area.status === 'full' && t('coverage.all_dealers_fast')}
                      {area.status === 'partial' && t('coverage.major_dealers')}
                      {area.status === 'negotiable' && t('coverage.on_request')}
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-800">
                  <strong>{t('coverage.expanding')}</strong> {t('coverage.contact_us')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoverageMap;