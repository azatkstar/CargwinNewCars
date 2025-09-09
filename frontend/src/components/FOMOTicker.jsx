import React, { useState, useEffect } from 'react';
import { Eye, TrendingUp, Car } from 'lucide-react';
import { getFOMOCounters } from '../mock';

const FOMOTicker = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const carModels = [
    'Honda Accord 2024',
    'Kia Niro EV 2025', 
    'Toyota Tacoma 2025',
    'Hyundai Elantra N 2024',
    'BMW 3 Series 2024',
    'Tesla Model 3 2024'
  ];

  const generateMessages = () => {
    const messages = [];
    
    carModels.forEach((model) => {
      const counters = getFOMOCounters(model.replace(/\s+/g, '-').toLowerCase());
      
      // Viewing message
      messages.push({
        icon: Eye,
        text: `Сейчас ${counters.viewers} человек смотрят ${model}`,
        type: 'viewing',
        color: 'text-blue-600'
      });
      
      // Confirmed message
      messages.push({
        icon: TrendingUp,
        text: `За 15 мин зафиксировали цену: ${counters.confirmed} — ${model}`,
        type: 'confirmed',
        color: 'text-green-600'
      });
      
      // Stock message (random for variety)
      if (Math.random() > 0.5) {
        const stockLeft = Math.floor(Math.random() * 3) + 1;
        messages.push({
          icon: Car,
          text: `Осталось ${stockLeft} шт — ${model}`,
          type: 'stock',
          color: 'text-red-600'
        });
      }
    });
    
    return messages;
  };

  const [messages, setMessages] = useState(generateMessages());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 4000); // Change message every 4 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  useEffect(() => {
    // Regenerate messages every 5 minutes to keep them fresh
    const regenerateInterval = setInterval(() => {
      setMessages(generateMessages());
    }, 5 * 60 * 1000);

    return () => clearInterval(regenerateInterval);
  }, []);

  const currentMsg = messages[currentMessage];

  if (!isVisible || !currentMsg) return null;

  const IconComponent = currentMsg.icon;

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <IconComponent className={`w-5 h-5 ${currentMsg.color}`} />
                <span className="text-sm font-medium text-gray-900">
                  {currentMsg.text}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                {messages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentMessage ? 'bg-red-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-red-600 text-white z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <IconComponent className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium truncate">
                {currentMsg.text}
              </span>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="text-white/80 hover:text-white text-sm ml-3 flex-shrink-0" 
            >
              ✕
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-red-700 rounded-full h-1 mt-2">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-4000 ease-linear"
              style={{ 
                width: `${((currentMessage + 1) / messages.length) * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default FOMOTicker;