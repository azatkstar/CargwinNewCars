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
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Credit
    credit_score: user?.credit_score || '',
    auto_loan_history: user?.auto_loan_history || false,
    
    // Employment (expanded)
    employment_type: user?.employment_type || '',
    employer_name: user?.employer_name || '',
    job_title: user?.job_title || '',
    time_at_job_months: user?.time_at_job_months || '',
    monthly_income_pretax: user?.monthly_income_pretax || '',
    annual_income: user?.annual_income || '',
    employment_duration_months: user?.employment_duration_months || '',
    
    // Personal
    date_of_birth: user?.date_of_birth || '',
    drivers_license_number: user?.drivers_license_number || '',
    immigration_status: user?.immigration_status || '',
    phone: user?.phone || '',
    
    // Address
    current_address: user?.current_address || '',
    current_address_duration_months: user?.current_address_duration_months || '',
    previous_address: user?.previous_address || '',
    address: user?.address || '',
    residence_duration_months: user?.residence_duration_months || '',
    
    // Financial
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
            
            {/* Progress Indicator */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`h-2 flex-1 rounded ${
                      step <= currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Credit</span>
                <span>Employment</span>
                <span>Personal</span>
                <span>Address</span>
                <span>Review</span>
              </div>
            </div>
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
                        <SelectItem value="self">Self-employed</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Employer Name *</label>
                    <Input
                      placeholder="Company name"
                      value={formData.employer_name}
                      onChange={(e) => handleChange('employer_name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Job Title *</label>
                    <Input
                      placeholder="e.g., Software Engineer"
                      value={formData.job_title}
                      onChange={(e) => handleChange('job_title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time at Current Job (months) *</label>
                    <Input
                      type="number"
                      placeholder="e.g. 24"
                      value={formData.time_at_job_months}
                      onChange={(e) => handleChange('time_at_job_months', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monthly Income (Pre-tax, 6mo avg) *</label>
                    <Input
                      type="number"
                      placeholder="e.g. 6250"
                      value={formData.monthly_income_pretax}
                      onChange={(e) => handleChange('monthly_income_pretax', e.target.value)}
                      required
                    />
                    <p className="text-xs text-gray-500">Before taxes, average last 6 months</p>
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

              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date of Birth *</label>
                    <Input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleChange('date_of_birth', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Driver's License Number *</label>
                    <Input
                      placeholder="CA DL number"
                      value={formData.drivers_license_number}
                      onChange={(e) => handleChange('drivers_license_number', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone Number *</label>
                    <Input
                      type="tel"
                      placeholder="(XXX) XXX-XXXX"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Immigration Status *</label>
                    <Select
                      value={formData.immigration_status}
                      onValueChange={(value) => handleChange('immigration_status', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">US Citizen</SelectItem>
                        <SelectItem value="green_card">Green Card</SelectItem>
                        <SelectItem value="asylum">Asylum</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
                      value={formData.current_address || formData.address}
                      onChange={(e) => {
                        handleChange('current_address', e.target.value);
                        handleChange('address', e.target.value);
                      }}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Time at Current Address (months) *</label>
                      <Input
                        type="number"
                        placeholder="e.g. 36"
                        value={formData.current_address_duration_months || formData.residence_duration_months}
                        onChange={(e) => {
                          handleChange('current_address_duration_months', e.target.value);
                          handleChange('residence_duration_months', e.target.value);
                        }}
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

                  {/* Previous Address - only if < 24 months at current */}
                  {formData.current_address_duration_months < 24 && (
                    <div className="space-y-2 bg-yellow-50 p-4 rounded border border-yellow-200">
                      <label className="text-sm font-medium">Previous Address *</label>
                      <Input
                        type="text"
                        placeholder="Previous address (required if < 2 years at current)"
                        value={formData.previous_address}
                        onChange={(e) => handleChange('previous_address', e.target.value)}
                        required
                      />
                      <p className="text-xs text-yellow-700">
                        Required because you've lived at current address less than 2 years
                      </p>
                    </div>
                  )}
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
