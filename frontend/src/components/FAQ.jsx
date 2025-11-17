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
  const faqs = [
    {
      id: 1,
      question: "What exactly is a 'dump offer'?",
      answer: "A dump offer is when a dealer needs to clear inventory fast - end of month, overstocked models, or last year's cars. Instead of keeping them on the lot, they sell to us at cost or below. We pass those savings directly to you. That's why you see $5K-$15K off MSRP."
    },
    {
      id: 2,
      question: "Is this rate real or will it change when I apply?",
      answer: "The monthly payment you see is REAL for the credit tier shown (usually 720+). If your actual credit score is different, your rate will adjust - higher score = better rate, lower score = higher rate. We show you the final number within 24 hours after soft check."
    },
    {
      id: 3,
      question: "Will checking my credit hurt my score?",
      answer: "No. We do a soft pull first (no score impact). Only if you approve the final deal and move forward, the dealer does a hard pull. You control when that happens."
    },
    {
      id: 4,
      question: "What happens after I book an offer?",
      answer: "Within 24 hours: (1) We run soft credit check, (2) Verify deal with dealer, (3) Send you final offer with exact monthly payment for YOUR credit score, (4) If you approve, dealer does hard pull, (5) E-sign contract online, (6) Schedule pickup (0-2 days)."
    },
    {
      id: 5,
      question: "Can I cancel after booking?",
      answer: "Yes, anytime before you e-sign the final contract. Your $97.49 deposit is fully refundable if you change your mind or if the dealer can't honor the deal."
    },
    {
      id: 6,
      question: "What if my credit score is lower than Tier 1?",
      answer: "You can still qualify! Lower scores (680-719, 640-679) usually mean a slightly higher rate and maybe more down payment. We'll show you what's available for YOUR score. Sometimes we can suggest alternative cars that are easier to approve."
    },
    {
      id: 7,
      question: "Are there hidden fees?",
      answer: "No. The price breakdown shows: MSRP, dealer discount, your price, taxes, DMV fees, doc fees. Everything is disclosed upfront. California requires full transparency - we follow that strictly."
    },
    {
      id: 8,
      question: "Who is my lease with - you or the dealer?",
      answer: "Your lease is with the manufacturer's finance company (Lexus Financial, Toyota Financial, etc.). The dealer is the seller. hunter.lease is just the platform that found you the deal. You're not locked to us - it's a normal factory lease."
    },
    {
      id: 9,
      question: "Do I have to pick up at a specific dealer?",
      answer: "The car comes from a specific dealer initially, but you can service it at ANY authorized dealer for that brand. Your warranty and prepaid maintenance (if included) work nationwide."
    },
    {
      id: 10,
      question: "What if the offer expires while I'm deciding?",
      answer: "Dump offers are time-sensitive. If you see it and want it, book it - the $97.49 deposit holds it for 48 hours. If it sells to someone else while you're thinking, it's gone. That's the nature of dump pricing."
    }
  ];
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
                  {t('faq.privacy_guarantee')}
                </h3>
                <p className="text-blue-800 leading-relaxed mb-4">
                  <strong>{t('faq.no_data_sharing')}</strong> {t('faq.privacy_explanation')}
                </p>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>{t('faq.this_means')}</strong> {t('faq.one_contact_process')}
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
                {t('faq.have_questions')}
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {t('faq.support_response')}
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