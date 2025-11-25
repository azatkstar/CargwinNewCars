import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const QuickAnswersAccordion = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'Why is this price so low?',
      answer: 'Fleet pricing. Same rates rental companies pay for bulk orders. Dealer needs to move inventory fast - you get the savings.'
    },
    {
      question: 'Are there hidden fees?',
      answer: 'No. Price includes CA taxes, DMV registration, doc fees. No dealer add-ons ($5,500 typical - we charge $0).'
    },
    {
      question: 'What if my credit score is lower?',
      answer: 'Still qualify! Lower scores (680-719) may have slightly higher monthly or more down payment. We work with Tier 1-6.'
    }
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="font-bold text-xl mb-4">Quick Answers</h3>
      
      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  openIndex === idx ? 'rotate-180' : ''
                }`}
              />
            </button>
            
            {openIndex === idx && (
              <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickAnswersAccordion;
