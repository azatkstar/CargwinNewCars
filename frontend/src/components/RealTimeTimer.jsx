import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const RealTimeTimer = ({ endTime }) => {
  const [time, setTime] = useState({ days: 1, hours: 23, minutes: 45, seconds: 0 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }
        if (days < 0) {
          days = 0;
          hours = 0;
          minutes = 0;
          seconds = 0;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex items-center gap-2 text-red-600">
      <Clock className="w-4 h-4" />
      <span className="font-bold">
        {time.days}d {time.hours}h {time.minutes}m {time.seconds}s
      </span>
    </div>
  );
};

export default RealTimeTimer;