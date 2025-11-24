import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

const LiveSocialProof = () => {
  const [activity, setActivity] = useState(null);
  
  useEffect(() => {
    generateActivity();
    const interval = setInterval(generateActivity, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const generateActivity = () => {
    const names = ['John', 'Emma', 'Michael', 'Sarah', 'David', 'Lisa', 'James', 'Jessica'];
    const cities = ['San Diego', 'Irvine', 'Los Angeles', 'Orange County', 'Riverside', 'Long Beach'];
    const actions = [
      { action: 'reserved a vehicle', min: 5, max: 30 },
      { action: 'viewed this offer', min: 1, max: 10 },
      { action: 'requested a quote', min: 15, max: 60 }
    ];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const activityType = actions[Math.floor(Math.random() * actions.length)];
    const minutes = Math.floor(Math.random() * (activityType.max - activityType.min) + activityType.min);
    
    setActivity({
      name,
      city,
      action: activityType.action,
      time: minutes
    });
  };
  
  if (!activity) return null;
  
  return (
    <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 flex items-center gap-2">
      <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
      <p className="text-sm text-gray-700">
        <strong>{activity.name}</strong> from {activity.city} {activity.action} <strong>{activity.time} minutes ago</strong>
      </p>
    </div>
  );
};

export default LiveSocialProof;