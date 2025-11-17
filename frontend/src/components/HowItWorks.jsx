import React from 'react';
import { Search, Lock, Car, ArrowRight } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

const HowItWorks = () => {
  const { t } = useI18n();
  
  const steps = [
    {
      id: 1,
      icon: Search,
      title: "Find Your Deal",
      description: "Browse real dump offers from LA dealers",
      details: [
        "See actual monthly payment for YOUR credit score",
        "All taxes and fees included - no surprises",
        "Offers update monthly with fresh inventory"
      ]
    },
    {
      id: 2,
      icon: Lock,
      title: "Book It",
      description: "Reserve in minutes, soft check only",
      details: [
        "Soft credit check - won't hurt your score",
        "We verify the deal with the dealer",
        "You get final offer within 24 hours"
      ]
    },
    {
      id: 3,
      icon: Car,
      title: "Pick Up",
      description: "Sign online, drive home in 0-2 days",
      details: [
        "E-sign your contract online",
        "Free delivery to your home or office",
        "No dealer visits until you pick up your car"
      ]
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('how_it_works.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('how_it_works.subtitle')}
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Desktop Flow Line */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-red-200 via-red-400 to-red-200" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              
              return (
                <div key={step.id} className="relative">
                  {/* Mobile Flow Arrow */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center mt-8 mb-8">
                      <ArrowRight className="w-6 h-6 text-red-400" />
                    </div>
                  )}

                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center hover:shadow-xl transition-shadow duration-300">
                    {/* Step Number & Icon */}
                    <div className="relative mb-6">
                      <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {step.id}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-16 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-center">
            <p className="text-yellow-800 font-medium mb-2">
              {t('how_it_works.important_condition')}
            </p>
            <p className="text-yellow-700">
              {t('how_it_works.credit_notice')}
            </p>
          </div>
        </div>

        {/* Benefits Summary */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-red-600 mb-2">
              {t('how_it_works.stat1_number')}
            </div>
            <div className="text-sm text-gray-600">
              {t('how_it_works.stat1_description')}
            </div>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {t('how_it_works.stat2_number')}
            </div>
            <div className="text-sm text-gray-600">
              {t('how_it_works.stat2_description')}
            </div>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {t('how_it_works.stat3_number')}
            </div>
            <div className="text-sm text-gray-600">
              {t('how_it_works.stat3_description')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;