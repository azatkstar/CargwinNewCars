import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Shield, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import { formatPhoneNumber } from '../utils/timer';
import { useI18n } from '../hooks/useI18n';

const CreditSoftCheck = () => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zip: '',
    creditBand: '',
    consent: false
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'phone' ? formatPhoneNumber(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock API call
    setTimeout(() => {
      console.log('Soft credit check submission:', formData);
      setSubmitted(true);
      setLoading(false);
    }, 2000);
  };

  const isFormValid = () => {
    return formData.firstName && 
           formData.lastName && 
           formData.email && 
           formData.phone && 
           formData.zip && 
           formData.creditBand && 
           formData.consent;
  };

  if (submitted) {
    return (
      <section id="credit" className="py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-green-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Проверка завершена!
              </h3>
              
              <p className="text-gray-600 mb-6">
                Мы получили ваши данные и проводим мягкую проверку кредитной истории. 
                Результаты и персональные предложения будут отправлены на ваш email в течение 15 минут.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Важно:</strong> Мягкая проверка не влияет на ваш кредитный рейтинг и не видна другим кредиторам.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="credit" className="py-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200">
            <CreditCard className="w-4 h-4" />
            Мягкая проверка кредита
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('forms.credit_check.title')}
          </h2>
          
          <p className="text-lg text-gray-600">
            Получите персональные предложения без влияния на кредитный рейтинг
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Не влияет на рейтинг</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <CreditCard className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Персональные условия</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Лучшие предложения</div>
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              {t('forms.credit_check.subtitle')}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Имя *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Фамилия *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Телефон *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(XXX) XXX-XXXX"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              {/* ZIP and Credit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zip">ZIP код *</Label>
                  <Input
                    id="zip"
                    type="text"
                    placeholder="90210"
                    value={formData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    className="mt-1"
                    maxLength={5}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="creditBand">Кредитный диапазон *</Label>
                  <Select value={formData.creditBand} onValueChange={(value) => handleInputChange('creditBand', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите диапазон" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Отличный (750+)</SelectItem>
                      <SelectItem value="good">Хороший (700-749)</SelectItem>
                      <SelectItem value="fair">Удовлетворительный (650-699)</SelectItem>
                      <SelectItem value="poor">Плохой (600-649)</SelectItem>
                      <SelectItem value="bad">Очень плохой (&lt;600)</SelectItem>
                      <SelectItem value="unknown">Не знаю</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => handleInputChange('consent', checked)}
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                  Я соглашаюсь на проведение мягкой проверки кредитной истории и получение персональных предложений. 
                  Понимаю, что мои данные не будут переданы дилерам для обзвонов.
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid() || loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 text-lg font-semibold"
              >
                {loading ? 'Проверяем...' : 'Получить условия финансирования'}
              </Button>
            </form>

            {/* Disclaimer */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-2">{t('forms.credit_check.important_terms')}:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Мягкая проверка не влияет на ваш кредитный балл</li>
                    <li>• Финальные условия зависят от полной проверки кредитной истории</li>
                    <li>• Мы не передаём ваши контакты дилерам для обзвонов</li>
                    <li>• Результаты придут на email в течение 15 минут</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CreditSoftCheck;