import React from 'react';
import { Search, Lock, Car, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      icon: Search,
      title: 'Выберите автомобиль',
      description: 'Доступ к закрытым fleet-ценам с VIN и точным сроком действия предложения',
      details: [
        'Реальные VIN номера',
        'Подтверждённые дилером цены',
        'Чёткие временные рамки'
      ]
    },
    {
      id: 2,
      icon: Lock,
      title: 'Забронируйте цену онлайн',
      description: 'Никаких допов — мы показываем средние суммы по моделям и убираем их',
      details: [
        'Без скрытых доплат',
        'Прозрачное ценообразование',
        'Фиксированная цена без торгов'
      ]
    },
    {
      id: 3,
      icon: Car,
      title: 'Забирайте готовый автомобиль',
      description: 'После 100% согласования условий приезжаете к дилеру за полностью готовым автомобилем',
      details: [
        'Один контакт с дилером',
        'Готовый к выдаче автомобиль',
        'Минимум времени у дилера'
      ]
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Как это работает
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Простой процесс из трёх шагов — от выбора до получения автомобиля
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
              ⚠️ Важное условие
            </p>
            <p className="text-yellow-700">
              Оформление автомобиля происходит при условии подходящей кредитной истории. 
              Мы делаем предварительную мягкую проверку (soft-check), которая не влияет на ваш кредитный рейтинг.
            </p>
          </div>
        </div>

        {/* Benefits Summary */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-red-600 mb-2">
              15 минут
            </div>
            <div className="text-sm text-gray-600">
              Среднее время на бронирование цены
            </div>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600 mb-2">
              $0
            </div>
            <div className="text-sm text-gray-600">
              Скрытых доплат и навязанных допов
            </div>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              1 контакт
            </div>
            <div className="text-sm text-gray-600">
              С дилером после согласования условий
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;