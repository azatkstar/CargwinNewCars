import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { X, SlidersHorizontal } from 'lucide-react';

const FiltersSidebar = ({ onFilterChange, onClear }) => {
  const [filters, setFilters] = useState({
    dealType: 'all',
    brand: 'all',
    model: 'all',
    budgetMin: 0,
    budgetMax: 2000,
    creditScore: 'all',
    term: 'all',
    mileage: 'all',
    fuelType: 'all'
  });

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) onFilterChange(newFilters);
  };

  const handleClear = () => {
    const cleared = {
      dealType: 'all',
      brand: 'all',
      model: 'all',
      budgetMin: 0,
      budgetMax: 2000,
      creditScore: 'all',
      term: 'all',
      mileage: 'all',
      fuelType: 'all'
    };
    setFilters(cleared);
    if (onClear) onClear();
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={handleClear}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Deal Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Deal Type</label>
          <Select value={filters.dealType} onValueChange={(v) => handleChange('dealType', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="lease">Lease Only</SelectItem>
              <SelectItem value="finance">Finance Only</SelectItem>
              <SelectItem value="cash">Cash Purchase</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Brand */}
        <div>
          <label className="text-sm font-medium mb-2 block">Brand</label>
          <Select value={filters.brand} onValueChange={(v) => handleChange('brand', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              <SelectItem value="lexus">Lexus</SelectItem>
              <SelectItem value="genesis">Genesis</SelectItem>
              <SelectItem value="toyota">Toyota</SelectItem>
              <SelectItem value="honda">Honda</SelectItem>
              <SelectItem value="bmw">BMW</SelectItem>
              <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Monthly Budget */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Monthly Budget: ${filters.budgetMin} - ${filters.budgetMax}
          </label>
          <div className="px-2">
            <Slider
              min={0}
              max={2000}
              step={50}
              value={[filters.budgetMin, filters.budgetMax]}
              onValueChange={([min, max]) => {
                handleChange('budgetMin', min);
                handleChange('budgetMax', max);
              }}
            />
          </div>
        </div>

        {/* Credit Score */}
        <div>
          <label className="text-sm font-medium mb-2 block">Your Credit Score</label>
          <Select value={filters.creditScore} onValueChange={(v) => handleChange('creditScore', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scores</SelectItem>
              <SelectItem value="720+">720+ (Tier 1)</SelectItem>
              <SelectItem value="680-719">680-719 (Tier 2)</SelectItem>
              <SelectItem value="640-679">640-679 (Tier 3)</SelectItem>
              <SelectItem value="600-639">600-639 (Tier 4)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lease Term */}
        <div>
          <label className="text-sm font-medium mb-2 block">Lease Term</label>
          <Select value={filters.term} onValueChange={(v) => handleChange('term', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Term</SelectItem>
              <SelectItem value="24">24 months</SelectItem>
              <SelectItem value="36">36 months</SelectItem>
              <SelectItem value="48">48 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Annual Mileage */}
        <div>
          <label className="text-sm font-medium mb-2 block">Annual Mileage</label>
          <Select value={filters.mileage} onValueChange={(v) => handleChange('mileage', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Mileage</SelectItem>
              <SelectItem value="7500">7,500 miles/year</SelectItem>
              <SelectItem value="10000">10,000 miles/year</SelectItem>
              <SelectItem value="12000">12,000 miles/year</SelectItem>
              <SelectItem value="15000">15,000 miles/year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fuel Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Fuel Type</label>
          <Select value={filters.fuelType} onValueChange={(v) => handleChange('fuelType', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="gas">Gas</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="plugin">Plug-in Hybrid</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Count */}
        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500">
            {Object.values(filters).filter(v => v !== 'all' && v !== 0 && v !== 2000).length} active filters
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FiltersSidebar;
