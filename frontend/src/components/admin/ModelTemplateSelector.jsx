import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Search, Car } from 'lucide-react';

const ModelTemplateSelector = ({ isOpen, onClose, onSelect }) => {
  const [templates, setTemplates] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${BACKEND_URL}/api/admin/model-templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      setTemplates(data.templates || {});
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = Object.entries(templates).filter(([name]) => 
    name.toLowerCase().includes(search.toLowerCase())
  );

  const groupByBrand = () => {
    const grouped = {};
    filteredTemplates.forEach(([name, data]) => {
      const brand = name.split(' ')[0];
      if (!grouped[brand]) grouped[brand] = [];
      grouped[brand].push([name, data]);
    });
    return grouped;
  };

  const brandGroups = groupByBrand();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Choose Model Template ({Object.keys(templates).length} available)
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by brand or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(brandGroups).map(([brand, models]) => (
              <div key={brand}>
                <h3 className="font-bold text-lg text-gray-900 mb-3">{brand}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {models.map(([name, data]) => (
                    <Card
                      key={name}
                      className="p-4 cursor-pointer hover:shadow-lg hover:border-red-500 transition-all"
                      onClick={() => {
                        const [make, ...modelParts] = name.split(' ');
                        const model = modelParts.join(' ');
                        onSelect(make, model, data);
                        onClose();
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          <Car className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{name}</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            MSRP: ${data.msrp_range[0].toLocaleString()} - ${data.msrp_range[1].toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {data.trims.length} trims • {data.fuel_type}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {data.trims.slice(0, 3).map(trim => (
                              <span key={trim} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                {trim}
                              </span>
                            ))}
                            {data.trims.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{data.trims.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            No templates found matching "{search}"
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModelTemplateSelector;
