import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';

const ApproveApplicationModal = ({ isOpen, onClose, application, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [financeType, setFinanceType] = useState('apr'); // apr or money_factor
  
  const [formData, setFormData] = useState({
    apr: '9.75',
    money_factor: '',
    loan_term: '60',
    down_payment: '3000',
    monthly_payment: '500',
    admin_notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('access_token');

      const payload = {
        loan_term: parseInt(formData.loan_term),
        down_payment: parseFloat(formData.down_payment),
        monthly_payment: parseFloat(formData.monthly_payment),
        admin_notes: formData.admin_notes || undefined
      };

      // Add APR or money factor
      if (financeType === 'apr') {
        payload.apr = parseFloat(formData.apr);
      } else {
        payload.money_factor = parseFloat(formData.money_factor);
      }

      const response = await fetch(
        `${BACKEND_URL}/api/admin/applications/${application.id}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('Application approved successfully!');
        onSuccess();
        onClose();
      } else {
        setError(data.detail || 'Failed to approve application');
      }
    } catch (err) {
      console.error('Approval error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Approve Application
          </DialogTitle>
          <DialogDescription>
            Enter financing details for {application?.lot_data?.year} {application?.lot_data?.make} {application?.lot_data?.model}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Finance Type Selection */}
          <Tabs value={financeType} onValueChange={setFinanceType}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="apr">APR (Finance)</TabsTrigger>
              <TabsTrigger value="money_factor">Money Factor (Lease)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="apr" className="space-y-4">
              <div>
                <Label htmlFor="apr">APR (%) *</Label>
                <Input
                  id="apr"
                  type="number"
                  step="0.01"
                  value={formData.apr}
                  onChange={(e) => setFormData({...formData, apr: e.target.value})}
                  placeholder="9.75"
                  required={financeType === 'apr'}
                />
                <p className="text-xs text-gray-500 mt-1">Annual Percentage Rate</p>
              </div>
            </TabsContent>
            
            <TabsContent value="money_factor" className="space-y-4">
              <div>
                <Label htmlFor="money_factor">Money Factor *</Label>
                <Input
                  id="money_factor"
                  type="number"
                  step="0.00001"
                  value={formData.money_factor}
                  onChange={(e) => setFormData({...formData, money_factor: e.target.value})}
                  placeholder="0.00250"
                  required={financeType === 'money_factor'}
                />
                <p className="text-xs text-gray-500 mt-1">Lease money factor (e.g., 0.00250)</p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="loan_term">Term (months) *</Label>
              <Input
                id="loan_term"
                type="number"
                value={formData.loan_term}
                onChange={(e) => setFormData({...formData, loan_term: e.target.value})}
                placeholder="60"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="down_payment">Down Payment ($) *</Label>
              <Input
                id="down_payment"
                type="number"
                step="100"
                value={formData.down_payment}
                onChange={(e) => setFormData({...formData, down_payment: e.target.value})}
                placeholder="3000"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="monthly_payment">Monthly Payment ($) *</Label>
            <Input
              id="monthly_payment"
              type="number"
              step="0.01"
              value={formData.monthly_payment}
              onChange={(e) => setFormData({...formData, monthly_payment: e.target.value})}
              placeholder="500"
              required
            />
          </div>

          <div>
            <Label htmlFor="admin_notes">Admin Notes (optional)</Label>
            <Textarea
              id="admin_notes"
              value={formData.admin_notes}
              onChange={(e) => setFormData({...formData, admin_notes: e.target.value})}
              placeholder="Additional notes for the customer..."
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Approving...' : 'Approve Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApproveApplicationModal;
