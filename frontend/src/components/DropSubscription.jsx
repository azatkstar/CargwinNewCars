import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Clock, Mail, Phone, Bell, TrendingUp } from 'lucide-react';
import { getNextMondayMidnight, formatTimeRemaining, formatPhoneNumber } from '../utils/timer';
import { useI18n } from '../hooks/useI18n';

const DropSubscription = () => {
  const { t } = useI18n();
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const nextDrop = getNextMondayMidnight();
      const remaining = formatTimeRemaining(nextDrop);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email && !phone) return;
    
    setLoading(true);
    
    // Mock API call
    setTimeout(() => {
      console.log('Drop subscription:', { email, phone });
      setSubscribed(true);
      setLoading(false);
      
      // Reset form after success message
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
        setPhone('');
      }, 3000);
    }, 1500);
  };

  const handlePhoneChange = (e) => {
    setPhone(formatPhoneNumber(e.target.value));
  };

  return (
    <section id="drop" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-red-200">
            <Bell className="w-4 h-4" />
            {t('drop.weekly_drop')}
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('drop.title')}
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('drop.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Timer Card */}
          <div>
            <Card className="border-2 border-red-200 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Clock className="w-6 h-6 text-red-600" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    До следующего дропа:
                  </h3>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-8" data-countdown="weekly-drop">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">
                      {timeRemaining.days}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">дней</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">
                      {timeRemaining.hours}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">часов</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">
                      {timeRemaining.minutes}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">минут</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-red-600 mb-2">
                      {timeRemaining.seconds}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">секунд</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-gray-700">
                    <strong>Следующий дроп:</strong> Понедельник, 00:00 по времени Лос-Анджелеса
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* What to Expect */}
            <div className="mt-8 space-y-4">
              <h4 className="text-lg font-bold text-gray-900">Что ожидать в следующем дропе:</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  <span>5-8 новых эксклюзивных предложений</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  <span>Экономия до $8,000 на популярных моделях</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0" />
                  <span>Специальные условия лизинга и финансирования</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                  <span>Ограниченный запас (1-3 автомобиля на модель)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Form */}
          <div>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <TrendingUp className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Получайте уведомления первыми
                  </h3>
                  <p className="text-gray-600">
                    Подпишитесь и узнавайте о новых дропах за 15 минут до публикации
                  </p>
                </div>

                {subscribed ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Подписка оформлена!</h4>
                    <p className="text-gray-600">Мы уведомим вас о следующем дропе</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Ваш email для уведомлений"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="text-center text-sm text-gray-500 font-medium">
                      или
                    </div>

                    <div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="tel"
                          placeholder="(XXX) XXX-XXXX для SMS"
                          value={phone}
                          onChange={handlePhoneChange}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={(!email && !phone) || loading}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 text-lg font-semibold"
                    >
                      {loading ? 'Подписываем...' : 'Подписаться на дропы'}
                    </Button>
                  </form>
                )}

                <div className="mt-6 text-xs text-gray-500 text-center leading-relaxed">
                  <p>
                    Мы отправляем только важные уведомления о новых предложениях. 
                    Никакого спама. Отписаться можно в любой момент.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* VIP Benefits */}
            <div className="mt-8 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-200">
              <h4 className="text-lg font-bold text-gray-900 mb-4">VIP преимущества подписчиков:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-yellow-600">⚡</span>
                  <span>Уведомления за 15 минут до публикации</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-yellow-600">🎯</span>
                  <span>Эксклюзивные предложения только для подписчиков</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-yellow-600">💎</span>
                  <span>Приоритетное бронирование популярных моделей</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DropSubscription;