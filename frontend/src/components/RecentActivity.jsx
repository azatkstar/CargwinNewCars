import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, Users, Star, Clock } from 'lucide-react';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Generate realistic activity feed
    const mockActivities = generateActivities();
    setActivities(mockActivities);

    // Update every 30 seconds
    const interval = setInterval(() => {
      setActivities(generateActivities());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const generateActivities = () => {
    const names = ['John', 'Sarah', 'Michael', 'Jessica', 'David', 'Emily', 'Robert', 'Lisa'];
    const cities = ['Los Angeles', 'Irvine', 'San Diego', 'San Francisco', 'Sacramento', 'Long Beach'];
    const cars = [
      { model: 'RX350', savings: 8234 },
      { model: 'TX500h', savings: 12468 },
      { model: 'ES350', savings: 6532 },
      { model: 'NX450h', savings: 9120 }
    ];
    const actions = ['reserved', 'applied for', 'picked up'];
    
    const recent = [];
    for (let i = 0; i < 5; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const car = cars[Math.floor(Math.random() * cars.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const minutesAgo = Math.floor(Math.random() * 60) + 1;
      
      recent.push({
        name,
        city,
        car: `2026 ${car.model}`,  // Changed to 2026
        action,
        savings: car.savings,
        time: minutesAgo < 60 ? `${minutesAgo} min ago` : 'Today'
      });
    }
    
    return recent;
  };

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <TrendingUp className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, idx) => (
            <div key={idx} className="flex items-start gap-3 pb-3 border-b border-green-100 last:border-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{activity.name}</span> from{' '}
                  <span className="text-gray-600">{activity.city}</span> just{' '}
                  <span className="text-green-700 font-medium">{activity.action}</span>{' '}
                  {activity.car}
                </p>
                {activity.action === 'picked up' && (
                  <p className="text-xs text-green-600 mt-1">
                    💰 Saved ${activity.savings.toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-green-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">247</div>
            <div className="text-xs text-gray-600">Cars This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700 flex items-center justify-center gap-1">
              4.8 <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="text-xs text-gray-600">Avg Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">15 min</div>
            <div className="text-xs text-gray-600">Avg Approval</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
