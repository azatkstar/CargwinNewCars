import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Mail, Phone, User, MessageSquare, Clock } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/timer';

const CarForms = ({ car }) => {
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    consent: false
  });

  const [dealForm, setDealForm] = useState({
    name: '',
    phone: '',
    email: '',
    consent: false
  });

  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [dealSubmitted, setDealSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [dealLoading, setDealLoading] = useState(false);
  const [submissionTime, setSubmissionTime] = useState(null);

  // Anti-spam timing gate
  React.useEffect(() => {
    setSubmissionTime(Date.now());
  }, []);

  const handleLeadInputChange = (field, value) => {
    setLeadForm(prev => ({
      ...prev,
      [field]: field === 'phone' ? formatPhoneNumber(value) : value
    }));
  };

  const handleDealInputChange = (field, value) => {
    setDealForm(prev => ({
      ...prev,
      [field]: field === 'phone' ? formatPhoneNumber(value) : value
    }));
  };

  const submitLead = async (e) => {
    e.preventDefault();
    
    // Anti-spam timing check
    if (Date.now() - submissionTime < 1500) {
      alert('Пожалуйста, подождите немного перед отправкой');
      return;
    }

    if (!leadForm.consent) {
      alert('Необходимо согласие на обработку данных');
      return;
    }

    setLeadLoading(true);

    try {
      // Mock API call
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...leadForm,
          carId: car.id,
          carTitle: car.title
        }),
      });

      if (response.ok) {
        console.log('Lead submitted:', leadForm);
        setLeadSubmitted(true);
      } else {
        throw new Error('Ошибка отправки');
      }
    } catch (error) {
      console.error('Lead submission error:', error);
      alert('Произошла ошибка. Попробуйте позже.');
    } finally {
      setLeadLoading(false);
    }
  };

  const submitDealIntent = async (e) => {
    e.preventDefault();
    
    // Anti-spam timing check
    if (Date.now() - submissionTime < 1500) {
      alert('Пожалуйста, подождите немного перед отправкой');
      return;
    }

    if (!dealForm.consent) {
      alert('Необходимо согласие на обработку данных');
      return;
    }

    setDealLoading(true);

    try {
      // Mock API call
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/deal-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...dealForm,
          dealId: car.id,
          carTitle: car.title
        }),
      });

      if (response.ok) {
        console.log('Deal intent submitted:', dealForm);
        setDealSubmitted(true);
      } else {
        throw new Error('Ошибка отправки');
      }
    } catch (error) {
      console.error('Deal intent submission error:', error);
      alert('Произошла ошибка. Попробуйте позже.');
    } finally {
      setDealLoading(false);
    }
  };

  const isLeadFormValid = () => {
    return leadForm.name && leadForm.phone && leadForm.email && leadForm.consent;
  };

  const isDealFormValid = () => {
    return dealForm.name && dealForm.phone && dealForm.email && dealForm.consent;
  };

  return (
    <div id="car-forms" className="space-y-8">
      {/* Get Offer Form */}
      <Card className="border-2 border-red-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-red-600" />
            Получить предложение
          </CardTitle>
          <p className="text-gray-600">
            Персональное предложение с учётом ваших потребностей
          </p>
        </CardHeader>
        
        <CardContent>
          {leadSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Заявка отправлена!</h3>
              <p className="text-gray-600 mb-4">
                Мы свяжемся с вами в течение 15 минут с персональным предложением
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Важно:</strong> Мы не передаём ваши данные дилерам для обзвонов. 
                  Контакт произойдёт только после согласования всех условий.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={submitLead} className="space-y-4">
              <div>
                <Label htmlFor="lead-name">Имя *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="lead-name"
                    type="text"
                    value={leadForm.name}
                    onChange={(e) => handleLeadInputChange('name', e.target.value)}
                    className="pl-10"
                    placeholder="Ваше имя"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="lead-phone">Телефон *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="lead-phone"
                    type="tel"
                    value={leadForm.phone}
                    onChange={(e) => handleLeadInputChange('phone', e.target.value)}
                    className="pl-10"
                    placeholder="(XXX) XXX-XXXX"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="lead-email">Email *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="lead-email"
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => handleLeadInputChange('email', e.target.value)}
                    className="pl-10"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="lead-message">Сообщение (опционально)</Label>
                <div className="relative mt-1">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Textarea
                    id="lead-message"
                    value={leadForm.message}
                    onChange={(e) => handleLeadInputChange('message', e.target.value)}
                    className="pl-10 min-h-[100px]"
                    placeholder="Дополнительные пожелания или вопросы..."
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="lead-consent"
                  checked={leadForm.consent}
                  onCheckedChange={(checked) => handleLeadInputChange('consent', checked)}
                />
                <Label htmlFor="lead-consent" className="text-sm leading-relaxed cursor-pointer">
                  Я соглашаюсь на обработку персональных данных и получение коммерческих предложений. 
                  Понимаю, что мои данные не будут переданы дилерам для обзвонов.
                </Label>
              </div>

              {/* Honeypot field */}
              <input
                type="text"
                name="website"
                style={{ display: 'none' }}
                tabIndex="-1"
                autoComplete="off"
              />

              <Button
                type="submit"
                disabled={!isLeadFormValid() || leadLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 py-3 text-lg font-semibold"
              >
                {leadLoading ? 'Отправляем...' : 'Получить предложение'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Check Availability Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Уточнить наличие
          </CardTitle>
          <p className="text-gray-600">
            Быстрая проверка доступности автомобиля
          </p>
        </CardHeader>
        
        <CardContent>
          {dealSubmitted ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Запрос отправлен!</h3>
              <p className="text-gray-600">
                Проверяем наличие и свяжемся с вами в течение 5 минут
              </p>
            </div>
          ) : (
            <form onSubmit={submitDealIntent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deal-name">Имя *</Label>
                  <Input
                    id="deal-name"
                    type="text"
                    value={dealForm.name}
                    onChange={(e) => handleDealInputChange('name', e.target.value)}
                    placeholder="Ваше имя"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="deal-phone">Телефон *</Label>
                  <Input
                    id="deal-phone"
                    type="tel"
                    value={dealForm.phone}
                    onChange={(e) => handleDealInputChange('phone', e.target.value)}
                    placeholder="(XXX) XXX-XXXX"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deal-email">Email *</Label>
                <Input
                  id="deal-email"
                  type="email"
                  value={dealForm.email}
                  onChange={(e) => handleDealInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="deal-consent"
                  checked={dealForm.consent}
                  onCheckedChange={(checked) => handleDealInputChange('consent', checked)}
                />
                <Label htmlFor="deal-consent" className="text-sm leading-relaxed cursor-pointer">
                  Согласие на обработку данных и контакт для уточнения наличия
                </Label>
              </div>

              {/* Honeypot field */}
              <input
                type="text"
                name="company"
                style={{ display: 'none' }}
                tabIndex="-1"
                autoComplete="off"
              />

              <Button
                type="submit"
                disabled={!isDealFormValid() || dealLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {dealLoading ? 'Проверяем...' : 'Уточнить наличие'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Contact Info */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Нужна помощь?</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div>📞 Телефон: +1 (747) CARGWIN</div>
          <div>💬 Telegram: @CargwinSupport</div>
          <div>📧 Email: help@cargwin.com</div>
          <div className="mt-4 text-xs text-gray-500">
            Поддержка 24/7 • Ответ в течение 15 минут
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarForms;