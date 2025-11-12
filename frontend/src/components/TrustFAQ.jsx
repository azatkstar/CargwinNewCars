import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Shield, DollarSign, Car, FileText, CheckCircle } from 'lucide-react';

const TrustFAQ = () => {
  const faqs = [
    {
      icon: DollarSign,
      question: "Why are your prices so low? High residual value trick?",
      answer: "No! Our low prices come from real fleet discounts, not residual manipulation. Standard residual: 55-60% of MSRP. You're not overpaying at lease end. Buy the car for fair market value or return it. Savings come from real fleet discounts ($30K+) unavailable to regular buyers."
    },
    {
      icon: Car,
      question: "Will I be tied to one dealer for service?",
      answer: "Absolutely not! Service at ANY official Lexus/Toyota dealer nationwide. Factory warranty works everywhere. Prepaid maintenance valid across all dealers. No dealer obligations. Your lease is with Lexus Financial Services, not the dealer."
    },
    {
      icon: Shield,
      question: "Can I test drive? How to protect my SSN?",
      answer: "Yes, test drive is possible WITHOUT RISK! CRITICAL: NEVER give your SSN to dealers during test drive. Just say 'I want to test the model'. If dealer gets your SSN, they lock you as their customer, blocking our fleet prices. After test drive, return to us for better pricing."
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Remove All Doubts
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <faq.icon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-700 text-sm">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustFAQ;
