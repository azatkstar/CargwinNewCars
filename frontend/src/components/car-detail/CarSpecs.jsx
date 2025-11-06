import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Car, Zap, Palette, FileText, DollarSign } from 'lucide-react';
import { formatPrice } from '../../utils/timer';

const CarSpecs = ({ car }) => {
  const specs = [
    { label: 'Year', value: car.specs.year, icon: Car },
    { label: 'Make', value: car.specs.make, icon: Car },
    { label: 'Model', value: car.specs.model, icon: Car },
    { label: 'Trim', value: car.specs.trim, icon: Car },
    { label: 'Engine', value: car.specs.engine, icon: Zap },
    { label: 'Transmission', value: car.specs.transmission, icon: Zap },
    { label: 'Drivetrain', value: car.specs.drivetrain, icon: Zap },
    { label: 'Exterior Color', value: car.specs.exteriorColor, icon: Palette },
    { label: 'Interior Color', value: car.specs.interiorColor, icon: Palette }
    // VIN removed - now in footer for compliance
  ];

  // Calculate known add-ons for this specific model
  const avgAddons = {
    'Honda Accord': 3445,
    'Kia Niro': 3860,
    'Toyota Tacoma': 4210,
    'Hyundai Elantra': 3780
  };

  const modelKey = Object.keys(avgAddons).find(key => car.title.includes(key));
  const addonsAmount = avgAddons[modelKey] || 3500;

  return (
    <div className="space-y-8">
      {/* Vehicle Specifications */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Car className="w-6 h-6 text-red-600" />
            Vehicle Specifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {specs.map((spec, index) => {
              const IconComponent = spec.icon;
              return (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 font-medium">{spec.label}</div>
                    <div className="text-lg font-semibold text-gray-900">{spec.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add-ons Information */}
      <Card className="border-2 border-orange-200 shadow-lg bg-orange-50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-orange-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-orange-600" />
            Typical Dealer Add-Ons in USA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900">
                  {car.specs.make} {car.specs.model} {car.specs.year}
                </span>
                <Badge className="bg-orange-100 text-orange-800">
                  Average Amount
                </Badge>
              </div>
              
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {formatPrice(addonsAmount)}
              </div>
              
              <p className="text-sm text-gray-700 mb-4">
                Typical forced add-ons and financial products at US dealerships for this model
              </p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Paint/fabric protection</span>
                  <span>$800-1,200</span>
                </div>
                <div className="flex justify-between">
                  <span>Extended warranty</span>
                  <span>$1,500-2,500</span>
                </div>
                <div className="flex justify-between">
                  <span>GAP insurance</span>
                  <span>$400-800</span>
                </div>
                <div className="flex justify-between">
                  <span>F&I department fees</span>
                  <span>$300-700</span>
                </div>
              </div>
            </div>

            <div className="bg-green-100 border border-green-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="font-semibold text-green-900">
                  Ours: $0 forced add-ons
                </span>
              </div>
              <p className="text-sm text-green-800">
                We show honest fleet pricing with no hidden fees or forced upsells
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarSpecs;