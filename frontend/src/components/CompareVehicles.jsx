import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { GitCompare, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const CompareVehicles = ({ availableCars = [] }) => {
  const [selectedCars, setSelectedCars] = useState([null, null, null]);
  const [showComparison, setShowComparison] = useState(false);

  const handleSelect = (index, carId) => {
    const newSelection = [...selectedCars];
    newSelection[index] = availableCars.find(c => c.id === carId) || null;
    setSelectedCars(newSelection);
  };

  const selectedCount = selectedCars.filter(c => c !== null).length;

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Compare Vehicles
          </h2>
          <p className="text-gray-600">
            Compare up to 3 vehicles side-by-side
          </p>
        </div>

        {/* Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map(idx => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <Select
                  value={selectedCars[idx]?.id || ''}
                  onValueChange={(val) => handleSelect(idx, val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select vehicle ${idx + 1}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCars.map(car => (
                      <SelectItem key={car.id} value={car.id}>
                        {car.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedCount >= 2 && (
          <div className="text-center">
            <Button
              onClick={() => setShowComparison(!showComparison)}
              className="bg-red-600 hover:bg-red-700"
            >
              <GitCompare className="w-4 h-4 mr-2" />
              {showComparison ? 'Hide' : 'Show'} Comparison
            </Button>
          </div>
        )}

        {/* Comparison Table */}
        {showComparison && selectedCount >= 2 && (
          <Card className="mt-6">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-4 text-left font-semibold">Feature</th>
                      {selectedCars.filter(c => c).map((car, idx) => (
                        <th key={idx} className="p-4 text-center">
                          <div className="text-sm font-semibold">{car?.title}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-4 font-medium">Monthly Payment</td>
                      {selectedCars.filter(c => c).map((car, idx) => (
                        <td key={idx} className="p-4 text-center font-bold text-green-600">
                          ${car?.lease?.monthly}/mo
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">MSRP</td>
                      {selectedCars.filter(c => c).map((car, idx) => (
                        <td key={idx} className="p-4 text-center">
                          ${car?.msrp?.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Fleet Price</td>
                      {selectedCars.filter(c => c).map((car, idx) => (
                        <td key={idx} className="p-4 text-center font-bold">
                          ${car?.fleet?.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Total Savings</td>
                      {selectedCars.filter(c => c).map((car, idx) => (
                        <td key={idx} className="p-4 text-center text-green-600 font-bold">
                          ${car?.savings?.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Due at Signing</td>
                      {selectedCars.filter(c => c).map((car, idx) => (
                        <td key={idx} className="p-4 text-center">
                          ${car?.lease?.dueAtSigning?.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">Action</td>
                      {selectedCars.filter(c => c).map((car, idx) => (
                        <td key={idx} className="p-4 text-center">
                          <Link to={`/car/${car?.id}`}>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">
                              View Details
                            </Button>
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompareVehicles;