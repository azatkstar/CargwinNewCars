import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PriceTrendChart = ({ car }) => {
  // Mock historical data - в production из API
  const data = [
    { month: 'June', payment: 326, isGreat: false },
    { month: 'July', payment: 358, isGreat: false },
    { month: 'Aug', payment: 358, isGreat: false },
    { month: 'Sept', payment: 285, isGreat: true },
    { month: 'Oct', payment: 235, isGreat: true },
    { month: 'Nov', payment: car?.lease?.monthly || 289, isGreat: true }
  ];

  const avgPayment = Math.round(data.reduce((sum, d) => sum + d.payment, 0) / data.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">AVG. MONTHLY PAYMENT TREND</CardTitle>
        <p className="text-sm text-gray-600">{car?.title || 'Vehicle'}</p>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-sm text-gray-600 mb-2">Great Payment</div>
          <div className="text-4xl font-bold text-gray-900">
            ${car?.lease?.monthly || 289}
          </div>
          <div className="inline-block mt-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
            ↓ Below Average
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis hide />
            <Tooltip formatter={(value) => `$${value}`} />
            <Bar dataKey="payment" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isGreat ? '#16a34a' : '#9ca3af'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <p className="text-xs text-gray-500 mt-4">
          *Payment based on 700+ credit score, 10K mi/yr, best term length, 1st mo + fees due at signing.
        </p>
      </CardContent>
    </Card>
  );
};

export default PriceTrendChart;
