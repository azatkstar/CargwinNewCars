import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Card, CardContent } from './ui/card';
import { Shield, Phone } from 'lucide-react';
import { mockFAQ } from '../mock';
import { useI18n } from '../hooks/useI18n';

const FAQ = () => {
  const { t } = useI18n();
  return (
    <section id="faq" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mb-12">
          <Accordion type="single" collapsible className="space-y-4">
            {mockFAQ.map((faq) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id.toString()}
                className="bg-gray-50 rounded-2xl border border-gray-200 px-6 data-[state=open]:bg-white data-[state=open]:shadow-lg transition-all duration-300"
              >
                <AccordionTrigger className="py-6 text-left hover:no-underline group">
                  <span className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-200">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-gray-700 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Privacy Highlight */}
        <Card className="mb-12 border-2 border-blue-200 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">
                  100% гарантия конфиденциальности
                </h3>
                <p className="text-blue-800 leading-relaxed mb-4">
                  <strong>Мы никогда не передаём ваши данные дилерам для обзвонов.</strong> 
                  В отличие от других сайтов, где ваш номер сразу попадает к десяткам дилеров, 
                  мы связываемся только с одним дилером и только после того, как вы на 100% 
                  согласовали все условия сделки.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Это означает:</strong> один звонок, одна встреча, один дилер — и ваш новый автомобиль готов к выдаче.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Phone className="w-6 h-6 text-red-600" />
              <h3 className="text-2xl font-bold text-gray-900">
                Остались вопросы?
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Наша команда отвечает на вопросы 24/7. Средний ответ — менее 15 минут.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">Telegram</div>
                <div className="text-sm text-gray-600">@CargwinSupport</div>
              </div>
              
              <div className="hidden sm:block w-px h-8 bg-gray-300" />
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">WhatsApp</div>
                <div className="text-sm text-gray-600">+1 (747) CARGWIN</div>
              </div>
              
              <div className="hidden sm:block w-px h-8 bg-gray-300" />
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">Email</div>
                <div className="text-sm text-gray-600">help@cargwin.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;