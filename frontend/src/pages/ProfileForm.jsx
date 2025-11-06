import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, CheckCircle, DollarSign, Home, Briefcase } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProfileForm = () => {
  const { user, getApiClient, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    credit_score: user?.credit_score || '',
    auto_loan_history: user?.auto_loan_history || false,
    employment_type: user?.employment_type || '',
    annual_income: user?.annual_income || '',
    employment_duration_months: user?.employment_duration_months || '',
    address: user?.address || '',
    residence_duration_months: user?.residence_duration_months || '',
    monthly_expenses: user?.monthly_expenses || '',
    down_payment_ready: user?.down_payment_ready || '',
    ssn: user?.ssn || ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.credit_score < 300 || formData.credit_score > 850) {
      setError('Credit score must be between 300 and 850');
      setLoading(false);
      return;
    }

    if (formData.annual_income < 0) {
      setError('Annual income must be positive');
      setLoading(false);
      return;
    }

    try {
      const api = getApiClient();
      await api.put('/api/user/profile', {
        credit_score: parseInt(formData.credit_score),
        auto_loan_history: formData.auto_loan_history,
        employment_type: formData.employment_type,
        annual_income: parseInt(formData.annual_income),
        employment_duration_months: parseInt(formData.employment_duration_months),
        address: formData.address,
        residence_duration_months: parseInt(formData.residence_duration_months),
        monthly_expenses: parseInt(formData.monthly_expenses),
        down_payment_ready: parseInt(formData.down_payment_ready),
        ssn: formData.ssn
      });

      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Updated!</h2>
            <p className="text-gray-600">Your credit profile has been successfully saved.</p>
            <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Credit Profile</CardTitle>
            <CardDescription>
              Help us pre-qualify you for the best financing options. All information is secure and confidential.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Credit Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <DollarSign className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Credit Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Credit Score *</label>
                    <Input
                      type="number"
                      placeholder="e.g. 720"
                      value={formData.credit_score}
                      onChange={(e) => handleChange('credit_score', e.target.value)}
                      min="300"
                      max="850"
                      required
                    />
                    <p className="text-xs text-gray-500">Range: 300-850</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Paid Off Auto Loans? *</label>
                    <Select
                      value={formData.auto_loan_history.toString()}
                      onValueChange={(value) => handleChange('auto_loan_history', value === 'true')}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={5}>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Social Security Number (SSN) *</label>
                  <Input
                    type="password"
                    placeholder="XXX-XX-XXXX"
                    value={formData.ssn}
                    onChange={(e) => handleChange('ssn', e.target.value)}
                    maxLength="11"
                    required
                  />
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mt-2">
                    <p className="text-xs text-blue-900">
                      🔒 <strong>Your security is our priority.</strong> Your SSN is encrypted with bank-level security (AES-256) 
                      and used solely for credit verification. We never share your information with third parties. 
                      This data is required by federal law for identity verification and credit checks.
                    </p>
                  </div>
                </div>
              </div>

              {/* Employment Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Briefcase className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Employment Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Employment Type *</label>
                    <Select
                      value={formData.employment_type}
                      onValueChange={(value) => handleChange('employment_type', value)}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={5}>
                        <SelectItem value="W2">W2 Employee</SelectItem>
                        <SelectItem value="1099">1099 Contractor</SelectItem>
                        <SelectItem value="Self-employed">Self-employed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Annual Income *</label>
                    <Input
                      type="number"
                      placeholder="e.g. 75000"
                      value={formData.annual_income}
                      onChange={(e) => handleChange('annual_income', e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">Before taxes</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time at Current Job (months) *</label>
                    <Input
                      type="number"
                      placeholder="e.g. 24"
                      value={formData.employment_duration_months}
                      onChange={(e) => handleChange('employment_duration_months', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Expenses *</label>
                    <Input
                      type="number"
                      placeholder="e.g. 2500"
                      value={formData.monthly_expenses}
                      onChange={(e) => handleChange('monthly_expenses', e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">Rent, utilities, etc.</p>
                  </div>
                </div>
              </div>

              {/* Residence Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Home className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Residence Information</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Address *</label>
                    <Input
                      type="text"
                      placeholder="123 Main St, Los Angeles, CA 90001"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time at Address (months) *</label>
                      <Input
                        type="number"
                        placeholder="e.g. 36"
                        value={formData.residence_duration_months}
                        onChange={(e) => handleChange('residence_duration_months', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Down Payment Ready *</label>
                      <Input
                        type="number"
                        placeholder="e.g. 5000"
                        value={formData.down_payment_ready}
                        onChange={(e) => handleChange('down_payment_ready', e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-500">Amount you can put down</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                🔒 Your information is encrypted and secure. We never share your data.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ProfileForm;
