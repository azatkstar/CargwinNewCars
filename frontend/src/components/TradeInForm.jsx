import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Car, Upload } from 'lucide-react';

const TradeInForm = ({ applicationId, onTradeInAdded }) => {
  const [tradeIn, setTradeIn] = useState({
    vin: '',
    year: new Date().getFullYear(),
    make: '',
    model: '',
    mileage: '',
    condition: 'good',
    photos: []
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('access_token');

      const response = await fetch(
        `${BACKEND_URL}/api/applications/${applicationId}/trade-in`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            vin: tradeIn.vin,
            year: parseInt(tradeIn.year),
            make: tradeIn.make,
            model: tradeIn.model,
            mileage: parseInt(tradeIn.mileage),
            condition: tradeIn.condition,
            photos: tradeIn.photos
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(`Trade-in added! Estimated value: $${data.trade_in_value?.toLocaleString()}`);
        if (onTradeInAdded) onTradeInAdded(data);
      } else {
        throw new Error(data.detail || 'Failed to add trade-in');
      }
    } catch (error) {
      console.error('Trade-in error:', error);
      alert('Failed to add trade-in: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5" />
          Trade-In Vehicle
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Get instant valuation for your current vehicle
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="vin">VIN Number *</Label>
              <Input
                id="vin"
                value={tradeIn.vin}
                onChange={(e) => setTradeIn({...tradeIn, vin: e.target.value})}
                placeholder="17-character VIN"
                maxLength={17}
                required
              />
            </div>

            <div>
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                value={tradeIn.year}
                onChange={(e) => setTradeIn({...tradeIn, year: e.target.value})}
                min="1990"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            <div>
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                value={tradeIn.make}
                onChange={(e) => setTradeIn({...tradeIn, make: e.target.value})}
                placeholder="e.g., Toyota"
                required
              />
            </div>

            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={tradeIn.model}
                onChange={(e) => setTradeIn({...tradeIn, model: e.target.value})}
                placeholder="e.g., Camry"
                required
              />
            </div>

            <div>
              <Label htmlFor="mileage">Mileage *</Label>
              <Input
                id="mileage"
                type="number"
                value={tradeIn.mileage}
                onChange={(e) => setTradeIn({...tradeIn, mileage: e.target.value})}
                placeholder="e.g., 45000"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="condition">Condition *</Label>
              <Select value={tradeIn.condition} onValueChange={(val) => setTradeIn({...tradeIn, condition: val})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Calculating...' : 'Get Trade-In Value'}
          </Button>

          <p className="text-xs text-gray-500">
            * Valuation provided by KBB alternative - actual value may vary
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default TradeInForm;