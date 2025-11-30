import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Trash2, Edit, Plus, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const US_STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

const TaxConfigs = () => {
  const { token } = useAuth();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  const emptyConfig = {
    state: 'CA',
    zip_prefixes: [],
    tax_rate: 0.075,
    tax_on_fees: true,
    acquisition_tax_rate: 0,
    doc_tax_rate: 0,
    registration_tax_rate: 0,
    other_tax_rate: 0,
    is_active: true
  };

  const [formData, setFormData] = useState(emptyConfig);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/tax-configs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setConfigs(data.configs || []);
    } catch (error) {
      console.error('Failed to fetch configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingConfig
        ? `${BACKEND_URL}/api/admin/tax-configs/${editingConfig.id}`
        : `${BACKEND_URL}/api/admin/tax-configs`;
      
      const method = editingConfig ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await fetchConfigs();
        setShowForm(false);
        setEditingConfig(null);
        setFormData(emptyConfig);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tax config?')) return;
    try {
      await fetch(`${BACKEND_URL}/api/admin/tax-configs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchConfigs();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData(config);
    setShowForm(true);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tax Configurations</h1>
          <p className="text-gray-600">Manage state and regional tax settings</p>
        </div>
        <Button onClick={() => { setShowForm(true); setFormData(emptyConfig); setEditingConfig(null); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Config
        </Button>
      </div>

      {!showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">State</th>
                    <th className="text-left p-2">Zip Prefixes</th>
                    <th className="text-left p-2">Tax Rate</th>
                    <th className="text-left p-2">Tax on Fees</th>
                    <th className="text-left p-2">Active</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((cfg) => (
                    <tr key={cfg.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{cfg.state}</td>
                      <td className="p-2">{cfg.zip_prefixes.length > 0 ? cfg.zip_prefixes.join(', ') : 'All'}</td>
                      <td className="p-2">{(cfg.tax_rate * 100).toFixed(2)}%</td>
                      <td className="p-2">{cfg.tax_on_fees ? 'Yes' : 'No'}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${cfg.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {cfg.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(cfg)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(cfg.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{editingConfig ? 'Edit' : 'Create'} Tax Configuration</CardTitle>
              <Button variant="ghost" onClick={() => { setShowForm(false); setEditingConfig(null); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>State *</Label>
                  <Select value={formData.state} onValueChange={(val) => setFormData({ ...formData, state: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Zip Prefixes (comma-separated, e.g. 90,91)</Label>
                  <Input 
                    value={formData.zip_prefixes.join(',')} 
                    onChange={(e) => setFormData({ ...formData, zip_prefixes: e.target.value ? e.target.value.split(',').map(v => v.trim()).filter(Boolean) : [] })} 
                    placeholder="Leave empty for state-wide"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sales Tax Rate (e.g. 0.075 for 7.5%)</Label>
                  <Input type="number" step="0.0001" value={formData.tax_rate} onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })} />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" checked={formData.tax_on_fees} onChange={(e) => setFormData({ ...formData, tax_on_fees: e.target.checked })} />
                  <Label>Tax on Fees</Label>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Acquisition Tax Rate</Label>
                  <Input type="number" step="0.0001" value={formData.acquisition_tax_rate} onChange={(e) => setFormData({ ...formData, acquisition_tax_rate: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <Label>Doc Tax Rate</Label>
                  <Input type="number" step="0.0001" value={formData.doc_tax_rate} onChange={(e) => setFormData({ ...formData, doc_tax_rate: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <Label>Registration Tax Rate</Label>
                  <Input type="number" step="0.0001" value={formData.registration_tax_rate} onChange={(e) => setFormData({ ...formData, registration_tax_rate: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <Label>Other Tax Rate</Label>
                  <Input type="number" step="0.0001" value={formData.other_tax_rate} onChange={(e) => setFormData({ ...formData, other_tax_rate: parseFloat(e.target.value) })} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                <Label>Active</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingConfig(null); }}>Cancel</Button>
                <Button type="submit">Save Configuration</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaxConfigs;