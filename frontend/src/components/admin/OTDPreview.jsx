import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calculator, Loader2 } from 'lucide-react';
import { formatPrice } from '../../utils/timer';

const OTDPreview = ({ msrp, state = 'CA' }) => {
  const [otdData, setOtdData] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateOTD = async () => {
    if (!msrp || msrp < 1000) return;

    setLoading(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/calc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          msrp,
          state,
          creditScore: 'good',
          downPayment: 0,
          term: 60
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOtdData(data);
      } else {
        throw new Error('Calculation failed');
      }
    } catch (error) {
      console.error('OTD calculation error:', error);
      // Mock calculation fallback
      const tax = msrp * 0.0825; // CA tax
      const fees = 500;
      setOtdData({
        estOtdoor: msrp + tax + fees,
        tax: Math.round(tax),
        fees,
        apr: 3.5
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          OTD Price Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Fleet-цена: <strong>{formatPrice(msrp)}</strong> | Штат: <strong>{state}</strong>
          </div>
          <Button
            onClick={calculateOTD}
            disabled={loading || !msrp}
            size="sm"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4 mr-2" />
            )}
            Рассчитать OTD
          </Button>
        </div>

        {otdData && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(msrp)}
                </div>
                <div className="text-xs text-gray-600">Fleet-цена</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-red-600">
                  +{formatPrice(otdData.tax)}
                </div>
                <div className="text-xs text-gray-600">Налог ({state})</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-orange-600">
                  +{formatPrice(otdData.fees)}
                </div>
                <div className="text-xs text-gray-600">Сборы</div>
              </div>
              
              <div>
                <div className="text-xl font-bold text-green-600">
                  {formatPrice(otdData.estOtdoor)}
                </div>
                <div className="text-xs text-gray-600">Итого OTD</div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="text-sm text-gray-700">
                <strong>APR:</strong> {otdData.apr}% | 
                <strong> Ежемесячно:</strong> ~{formatPrice(otdData.estOtdoor / 60)} (60 мес)
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-600 text-center">
              * Расчет для кредитного рейтинга "Хороший", без первоначального взноса
            </div>
          </div>
        )}

        {!otdData && !loading && (
          <div className="text-center py-4 text-gray-500 text-sm">
            Нажмите "Рассчитать OTD" для предпросмотра итоговой стоимости
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OTDPreview;