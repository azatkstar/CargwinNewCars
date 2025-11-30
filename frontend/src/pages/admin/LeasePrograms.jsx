import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Trash2, Edit, Plus, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const US_STATES = ['ALL', 'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

const LeasePrograms = () => {
  const { token } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [filters, setFilters] = useState({ brand: '', state: '', is_active: 'all' });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  const emptyProgram = {
    brand: '',
    model_pattern: '',
    trim_pattern: '',
    year_from: new Date().getFullYear(),
    year_to: new Date().getFullYear() + 1,
    states: ['ALL'],
    credit_tier_min_score: 680,
    lease_terms: [36],
    default_term: 36,
    mileage_options: [10000],
    default_mileage: 10000,
    residual_percent: 56.0,
    money_factor: 0.00182,
    acquisition_fee: 695,
    doc_fee: 85,
    registration_fee_base: 540,
    other_fees: 0,
    due_at_signing_type: 'first_plus_fees',
    fixed_due_at_signing: null,
    lender_name: 'Manufacturer Financial',
    incentives: [],
    program_start: new Date().toISOString().split('T')[0],
    program_end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true
  };

  const [formData, setFormData] = useState(emptyProgram);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/lease-programs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPrograms(data.programs || []);
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProgram
        ? `${BACKEND_URL}/api/admin/lease-programs/${editingProgram.id}`
        : `${BACKEND_URL}/api/admin/lease-programs`;
      
      const method = editingProgram ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await fetchPrograms();
        setShowForm(false);
        setEditingProgram(null);
        setFormData(emptyProgram);
      }
    } catch (error) {
      console.error('Failed to save program:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lease program?')) return;
    try {
      await fetch(`${BACKEND_URL}/api/admin/lease-programs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchPrograms();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData(program);
    setShowForm(true);
  };

  const addIncentive = () => {
    setFormData({
      ...formData,
      incentives: [...formData.incentives, { name: '', amount: 0, stackable: true, start_date: '', end_date: '' }]
    });
  };

  const removeIncentive = (index) => {
    setFormData({
      ...formData,
      incentives: formData.incentives.filter((_, i) => i !== index)
    });
  };

  const filteredPrograms = programs.filter(p => {
    if (filters.brand && !p.brand.toLowerCase().includes(filters.brand.toLowerCase())) return false;
    if (filters.state !== '' && filters.state !== 'all' && !p.states.includes(filters.state)) return false;
    if (filters.is_active !== 'all' && p.is_active !== (filters.is_active === 'true')) return false;
    return true;
  });

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Lease Programs</h1>
          <p className="text-gray-600">Manage lease program configurations</p>
        </div>
        <Button onClick={() => { setShowForm(true); setFormData(emptyProgram); setEditingProgram(null); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Program
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4">
            <Input
              placeholder="Filter by brand"
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            />
            <Select value={filters.state} onValueChange={(val) => setFilters({ ...filters, state: val })}>
              <SelectTrigger>
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.is_active} onValueChange={(val) => setFilters({ ...filters, is_active: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {!showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Brand</th>
                    <th className="text-left p-2">Model</th>
                    <th className="text-left p-2">Year Range</th>
                    <th className="text-left p-2">States</th>
                    <th className="text-left p-2">Term</th>
                    <th className="text-left p-2">Mileage</th>
                    <th className="text-left p-2">Residual %</th>
                    <th className="text-left p-2">Active</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrograms.map((prog) => (
                    <tr key={prog.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{prog.brand}</td>
                      <td className="p-2">{prog.model_pattern || 'All'}</td>
                      <td className="p-2">{prog.year_from}-{prog.year_to}</td>
                      <td className="p-2">{prog.states.join(', ')}</td>
                      <td className="p-2">{prog.default_term}mo</td>
                      <td className="p-2">{prog.default_mileage.toLocaleString()}</td>
                      <td className="p-2">{prog.residual_percent}%</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${prog.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {prog.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(prog)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(prog.id)}>
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

      {/* Form Modal */}
      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{editingProgram ? 'Edit' : 'Create'} Lease Program</CardTitle>
                <CardDescription>Configure lease program parameters</CardDescription>
              </div>
              <Button variant="ghost" onClick={() => { setShowForm(false); setEditingProgram(null); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Brand *</Label>
                  <Input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
                </div>
                <div>
                  <Label>Model Pattern (optional)</Label>
                  <Input value={formData.model_pattern} onChange={(e) => setFormData({ ...formData, model_pattern: e.target.value })} placeholder="e.g. Corolla, Camry" />
                </div>
                <div>
                  <Label>Trim Pattern (optional)</Label>
                  <Input value={formData.trim_pattern} onChange={(e) => setFormData({ ...formData, trim_pattern: e.target.value })} placeholder="e.g. LE, XLE" />
                </div>
                <div>
                  <Label>Lender Name</Label>
                  <Input value={formData.lender_name} onChange={(e) => setFormData({ ...formData, lender_name: e.target.value })} />
                </div>
              </div>

              {/* Year & States */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Year From</Label>
                  <Input type="number" value={formData.year_from} onChange={(e) => setFormData({ ...formData, year_from: parseInt(e.target.value) })} />
                </div>
                <div>
                  <Label>Year To</Label>
                  <Input type="number" value={formData.year_to} onChange={(e) => setFormData({ ...formData, year_to: parseInt(e.target.value) })} />
                </div>
                <div>
                  <Label>Min Credit Score</Label>
                  <Input type="number" value={formData.credit_tier_min_score} onChange={(e) => setFormData({ ...formData, credit_tier_min_score: parseInt(e.target.value) })} />
                </div>
              </div>

              {/* Terms & Mileage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lease Terms (comma-separated)</Label>
                  <Input value={formData.lease_terms.join(',')} onChange={(e) => setFormData({ ...formData, lease_terms: e.target.value.split(',').map(v => parseInt(v.trim())).filter(Boolean) })} placeholder="24,36,39,48" />
                </div>
                <div>
                  <Label>Default Term</Label>
                  <Input type="number" value={formData.default_term} onChange={(e) => setFormData({ ...formData, default_term: parseInt(e.target.value) })} />
                </div>
                <div>
                  <Label>Mileage Options (comma-separated)</Label>
                  <Input value={formData.mileage_options.join(',')} onChange={(e) => setFormData({ ...formData, mileage_options: e.target.value.split(',').map(v => parseInt(v.trim())).filter(Boolean) })} placeholder="7500,10000,12000" />
                </div>
                <div>
                  <Label>Default Mileage</Label>
                  <Input type="number" value={formData.default_mileage} onChange={(e) => setFormData({ ...formData, default_mileage: parseInt(e.target.value) })} />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Residual % (e.g. 56.0)</Label>
                  <Input type="number" step="0.1" value={formData.residual_percent} onChange={(e) => setFormData({ ...formData, residual_percent: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <Label>Money Factor (e.g. 0.00182)</Label>
                  <Input type="number" step="0.00001" value={formData.money_factor} onChange={(e) => setFormData({ ...formData, money_factor: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <Label>Acquisition Fee</Label>
                  <Input type="number" value={formData.acquisition_fee} onChange={(e) => setFormData({ ...formData, acquisition_fee: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <Label>Doc Fee</Label>
                  <Input type="number" value={formData.doc_fee} onChange={(e) => setFormData({ ...formData, doc_fee: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <Label>Registration Fee</Label>
                  <Input type="number" value={formData.registration_fee_base} onChange={(e) => setFormData({ ...formData, registration_fee_base: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <Label>Other Fees</Label>
                  <Input type="number" value={formData.other_fees} onChange={(e) => setFormData({ ...formData, other_fees: parseFloat(e.target.value) })} />
                </div>
              </div>

              {/* Program Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Program Start</Label>
                  <Input type="date" value={formData.program_start} onChange={(e) => setFormData({ ...formData, program_start: e.target.value })} />
                </div>
                <div>
                  <Label>Program End</Label>
                  <Input type="date" value={formData.program_end} onChange={(e) => setFormData({ ...formData, program_end: e.target.value })} />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingProgram(null); }}>Cancel</Button>
                <Button type="submit">Save Program</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeasePrograms;