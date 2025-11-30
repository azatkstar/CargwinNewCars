import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Trash2, Edit, Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const FinancePrograms = () => {
  const { token } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  const emptyProgram = {
    brand: '',
    model_pattern: '',
    trim_pattern: '',
    year_from: new Date().getFullYear(),
    year_to: new Date().getFullYear() + 1,
    states: ['ALL'],
    credit_tier_min_score: 680,
    apr_options: [5.99],
    default_apr: 5.99,
    terms: [60],
    default_term: 60,
    down_payment_options: [0, 1000, 2500, 5000],
    lender_name: 'Manufacturer Financial',
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
      const res = await fetch(`${BACKEND_URL}/api/admin/finance-programs`, {
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
        ? `${BACKEND_URL}/api/admin/finance-programs/${editingProgram.id}`
        : `${BACKEND_URL}/api/admin/finance-programs`;
      
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
    if (!window.confirm('Delete this finance program?')) return;
    try {
      await fetch(`${BACKEND_URL}/api/admin/finance-programs/${id}`, {
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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Finance Programs</h1>
          <p className="text-gray-600">Manage finance program configurations</p>
        </div>
        <Button onClick={() => { setShowForm(true); setFormData(emptyProgram); setEditingProgram(null); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Program
        </Button>
      </div>

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
                    <th className="text-left p-2">APR Options</th>
                    <th className="text-left p-2">Terms</th>
                    <th className="text-left p-2">Active</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((prog) => (
                    <tr key={prog.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{prog.brand}</td>
                      <td className="p-2">{prog.model_pattern || 'All'}</td>
                      <td className="p-2">{prog.year_from}-{prog.year_to}</td>
                      <td className="p-2">{prog.apr_options.join(', ')}%</td>
                      <td className="p-2">{prog.terms.join(', ')}mo</td>
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

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{editingProgram ? 'Edit' : 'Create'} Finance Program</CardTitle>
              <Button variant="ghost" onClick={() => { setShowForm(false); setEditingProgram(null); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Brand *</Label>
                  <Input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
                </div>
                <div>
                  <Label>Model Pattern</Label>
                  <Input value={formData.model_pattern} onChange={(e) => setFormData({ ...formData, model_pattern: e.target.value })} />
                </div>
                <div>
                  <Label>Trim Pattern</Label>
                  <Input value={formData.trim_pattern} onChange={(e) => setFormData({ ...formData, trim_pattern: e.target.value })} />
                </div>
                <div>
                  <Label>Lender Name</Label>
                  <Input value={formData.lender_name} onChange={(e) => setFormData({ ...formData, lender_name: e.target.value })} />
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>APR Options (comma-separated, e.g. 5.99,6.99)</Label>
                  <Input value={formData.apr_options.join(',')} onChange={(e) => setFormData({ ...formData, apr_options: e.target.value.split(',').map(v => parseFloat(v.trim())).filter(Boolean) })} />
                </div>
                <div>
                  <Label>Default APR</Label>
                  <Input type="number" step="0.01" value={formData.default_apr} onChange={(e) => setFormData({ ...formData, default_apr: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <Label>Terms (comma-separated, e.g. 48,60,72)</Label>
                  <Input value={formData.terms.join(',')} onChange={(e) => setFormData({ ...formData, terms: e.target.value.split(',').map(v => parseInt(v.trim())).filter(Boolean) })} />
                </div>
                <div>
                  <Label>Default Term</Label>
                  <Input type="number" value={formData.default_term} onChange={(e) => setFormData({ ...formData, default_term: parseInt(e.target.value) })} />
                </div>
              </div>

              <div>
                <Label>Down Payment Options (comma-separated, e.g. 0,1000,2500)</Label>
                <Input value={formData.down_payment_options.join(',')} onChange={(e) => setFormData({ ...formData, down_payment_options: e.target.value.split(',').map(v => parseInt(v.trim())).filter(Boolean) })} />
              </div>

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

export default FinancePrograms;
