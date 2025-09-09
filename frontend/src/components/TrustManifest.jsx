import React from 'react';
import { Shield, DollarSign, Clock, Lock, RotateCcw, Headphones, CheckCircle } from 'lucide-react';

const TrustManifest = () => {
  const trustPoints = [
    {
      icon: CheckCircle,
      title: 'Только реальные предложения',
      description: 'VIN номера подтверждены дилерами. Никаких приманок или фейковых цен.',
      highlight: 'Проверенные VIN'
    },
    {
      icon: DollarSign,
      title: 'Без скрытых платежей и допов',
      description: 'То, что вы видите — то и платите. Никаких сюрпризов в последний момент.',
      highlight: 'Прозрачная цена'
    },
    {
      icon: Clock,
      title: 'Фиксированная цена — без торгов',
      description: 'Не тратьте время на переговоры. Цена уже лучшая из возможных.',
      highlight: 'Без торгов'
    },
    {
      icon: Lock,
      title: 'Конфиденциальность данных',
      description: 'Мы не передаём ваши контакты дилерам для обзвонов. Только согласованный контакт.',
      highlight: 'Защита приватности'
    },
    {
      icon: RotateCcw,
      title: 'Гарантия возврата депозита',
      description: 'Депозит возвращается полностью, если вы откажетесь до подписания документов.',
      highlight: '100% возврат'
    },
    {
      icon: Headphones,
      title: 'Поддержка 24/7',
      description: 'Отвечаем на вопросы в течение 15 минут в любое время дня и ночи.',
      highlight: 'Ответ ≤ 15 минут'
    }
  ];

  return (
    <section id="trust" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-green-200">
            <Shield className="w-4 h-4" />
            Манифест доверия
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Наши обязательства перед вами
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Мы построили бизнес на доверии и прозрачности. Каждое обещание — это наша репутация.
          </p>
        </div>

        {/* Trust Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {trustPoints.map((point, index) => {
            const IconComponent = point.icon;
            
            return (
              <div 
                key={index}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-red-200 group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-700 transition-colors duration-300">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-sm">
                        {point.title}
                      </h3>
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
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
                2,847
              </div>
              <div className="text-sm text-gray-600">
                Довольных клиентов
              </div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                $4.2M
              </div>
              <div className="text-sm text-gray-600">
                Сэкономлено клиентами
              </div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                98.4%
              </div>
              <div className="text-sm text-gray-600">
                Рекомендуют друзьям
              </div>
            </div>
            
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                12мин
              </div>
              <div className="text-sm text-gray-600">
                Средний ответ поддержки
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
                Наша гарантия конфиденциальности
              </h3>
              <p className="text-blue-800 leading-relaxed">
                <strong>Мы никогда не передаём ваши контактные данные дилерам для обзвонов.</strong> 
                Контакт с дилером происходит только после того, как вы на 100% согласовали все условия сделки. 
                Это означает один звонок, одну встречу, один дилер — и ваш новый автомобиль готов к выдаче.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustManifest;