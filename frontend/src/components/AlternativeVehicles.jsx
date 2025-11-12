import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TrendingDown, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AlternativeVehicles = ({ applicationId, selectedCar }) => {
  const [alternatives, setAlternatives] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (applicationId) {
      fetchAlternatives();
    }
  }, [applicationId]);

  const fetchAlternatives = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${BACKEND_URL}/api/applications/${applicationId}/auto-alternatives`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      const data = await response.json();
      setAlternatives(data.alternatives);
    } catch (error) {
      console.error('Failed to fetch alternatives:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (!alternatives || alternatives.count === 0) return null;

  return (
    <Card className="mt-6 border-blue-200">
      <CardHeader>
        <CardTitle>Alternative Options</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          We found {alternatives.count} alternative vehicles for you
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cheaper Option */}
          {alternatives.cheaper && (
            <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
              <Badge className="bg-green-600 text-white mb-2">
                <TrendingDown className="w-3 h-3 mr-1" />
                Budget Option
              </Badge>
              <h3 className="font-semibold text-sm mb-2">{alternatives.cheaper.title}</h3>
              <div className="text-2xl font-bold text-green-700 mb-1">
                ${alternatives.cheaper.monthly}/mo
              </div>
              <div className="text-xs text-green-600 mb-3">
                Save ${alternatives.cheaper.savings_vs_original}/month
              </div>
              <Link to={`/car/${alternatives.cheaper.slug}`}>
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                  View Details
                </Button>
              </Link>
            </div>
          )}

          {/* Similar Option */}
          {alternatives.similar && (
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <Badge className="bg-blue-600 text-white mb-2">
                <DollarSign className="w-3 h-3 mr-1" />
                Similar Price
              </Badge>
              <h3 className="font-semibold text-sm mb-2">{alternatives.similar.title}</h3>
              <div className="text-2xl font-bold text-blue-700 mb-1">
                ${alternatives.similar.monthly}/mo
              </div>
              <div className="text-xs text-blue-600 mb-3">
                {alternatives.similar.price_diff >= 0 ? '+' : ''}
                ${Math.abs(alternatives.similar.price_diff)}/month
              </div>
              <Link to={`/car/${alternatives.similar.slug}`}>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                  View Details
                </Button>
              </Link>
            </div>
          )}

          {/* Luxury Option */}
          {alternatives.luxury && (
            <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
              <Badge className="bg-purple-600 text-white mb-2">
                <TrendingUp className="w-3 h-3 mr-1" />
                Premium Upgrade
              </Badge>
              <h3 className="font-semibold text-sm mb-2">{alternatives.luxury.title}</h3>
              <div className="text-2xl font-bold text-purple-700 mb-1">
                ${alternatives.luxury.monthly}/mo
              </div>
              <div className="text-xs text-purple-600 mb-3">
                +${alternatives.luxury.upgrade_cost}/month
              </div>
              <Link to={`/car/${alternatives.luxury.slug}`}>
                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                  View Details
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlternativeVehicles;