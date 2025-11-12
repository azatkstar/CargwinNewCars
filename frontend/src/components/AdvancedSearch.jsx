import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, X } from 'lucide-react';

const AdvancedSearch = ({ onSearch }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    creditScoreMin: '',
    creditScoreMax: '',
    incomeMin: '',
    incomeMax: '',
    status: 'all',
    hasTradeIn: 'all'
  });

  const handleSearch = () => {
    if (onSearch) onSearch(filters);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      creditScoreMin: '',
      creditScoreMax: '',
      incomeMin: '',
      incomeMax: '',
      status: 'all',
      hasTradeIn: 'all'
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, VIN..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button onClick={handleSearch} className="bg-red-600 hover:bg-red-700">
              Search
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded border">
              <div>
                <label className="text-xs font-medium mb-1 block">Min Credit Score</label>
                <Input
                  type="number"
                  placeholder="e.g., 680"
                  value={filters.creditScoreMin}
                  onChange={(e) => setFilters({...filters, creditScoreMin: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Max Credit Score</label>
                <Input
                  type="number"
                  placeholder="e.g., 850"
                  value={filters.creditScoreMax}
                  onChange={(e) => setFilters({...filters, creditScoreMax: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Min Income</label>
                <Input
                  type="number"
                  placeholder="e.g., 50000"
                  value={filters.incomeMin}
                  onChange={(e) => setFilters({...filters, incomeMin: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Max Income</label>
                <Input
                  type="number"
                  placeholder="e.g., 150000"
                  value={filters.incomeMax}
                  onChange={(e) => setFilters({...filters, incomeMax: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Status</label>
                <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Trade-In</label>
                <Select value={filters.hasTradeIn} onValueChange={(v) => setFilters({...filters, hasTradeIn: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="yes">With Trade-In</SelectItem>
                    <SelectItem value="no">No Trade-In</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex gap-2">
                <Button onClick={clearFilters} variant="outline" className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;