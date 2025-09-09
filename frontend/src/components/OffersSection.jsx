import React, { useState } from 'react';
import OfferCard from './OfferCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { mockOffers } from '../mock';
import { Mail, Phone } from 'lucide-react';

const OffersSection = () => {
  const [sortBy, setSortBy] = useState('savings');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const sortedOffers = [...mockOffers].sort((a, b) => {
    switch (sortBy) {
      case 'savings':
        return b.savings - a.savings;
      case 'price':
        return a.fleet - b.fleet;
      case 'brand':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email && !phone) return;
    
    // Mock subscription
    console.log('Subscribing:', { email, phone });
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <section id="offers" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Текущие Fleet-предложения
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Эксклюзивные цены от дилеров Лос-Анджелеса. Без торгов, без допов, без обзвонов.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Сортировать по:
            </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите сортировку" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Максимальная экономия</SelectItem>
                <SelectItem value="price">Минимальная цена</SelectItem>
                <SelectItem value="brand">По алфавиту</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {sortedOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>

        {/* Subscription Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Подписаться на новые дропы
            </h3>
            <p className="text-gray-600">
              Получайте уведомления о новых fleet-предложениях первыми
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Ваш email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="(XXX) XXX-XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={(!email && !phone) || subscribed}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subscribed ? '✓ Подписка оформлена!' : 'Подписаться на дропы'}
            </Button>
          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Мы не передаём ваши данные дилерам. Отписаться можно в любой момент.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-sm text-blue-800 leading-relaxed">
            <strong>Важное примечание:</strong> Все платежи являются приблизительными и зависят от кредитной истории, первоначального взноса, срока кредитования и других факторов. Финальные условия определяются дилером после одобрения кредита. Предложения действительны до указанной даты или до окончания наличия автомобилей.
          </p>
        </div>
      </div>
    </section>
  );
};

export default OffersSection;