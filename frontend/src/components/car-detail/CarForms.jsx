import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Mail, Phone, User, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/timer';
import { useAuth } from '../../hooks/useAuth';

const CarForms = ({ car }) => {
  const { user, isAuthenticated, getApiClient } = useAuth();
  const navigate = useNavigate();
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    consent: false
  });

  const [dealForm, setDealForm] = useState({
    name: '',
    phone: '',
    email: '',
    consent: false
  });

  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [dealSubmitted, setDealSubmitted] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [dealLoading, setDealLoading] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [submissionTime, setSubmissionTime] = useState(null);
  const [applicationError, setApplicationError] = useState('');

  // Anti-spam timing gate
  React.useEffect(() => {
    setSubmissionTime(Date.now());
  }, []);

  const handleLeadInputChange = (field, value) => {
    setLeadForm(prev => ({
      ...prev,
      [field]: field === 'phone' ? formatPhoneNumber(value) : value
    }));
  };

  const handleDealInputChange = (field, value) => {
    setDealForm(prev => ({
      ...prev,
      [field]: field === 'phone' ? formatPhoneNumber(value) : value
    }));
  };

  const submitLead = async (e) => {
    e.preventDefault();
    
    // Anti-spam timing check
    if (Date.now() - submissionTime < 1500) {
      alert('Please wait a moment before submitting');
      return;
    }

    if (!leadForm.consent) {
      alert('Consent to data processing is required');
      return;
    }

    setLeadLoading(true);

    try {
      // Mock API call
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...leadForm,
          carId: car.id,
          carTitle: car.title
        }),
      });

      if (response.ok) {
        console.log('Lead submitted:', leadForm);
        setLeadSubmitted(true);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Lead submission error:', error);
      alert('An error occurred. Please try again later.');
    } finally {
      setLeadLoading(false);
    }
  };

  const submitDealIntent = async (e) => {
    e.preventDefault();
    
    // Anti-spam timing check
    if (Date.now() - submissionTime < 1500) {
      alert('Please wait a moment before submitting');
      return;
    }

    if (!dealForm.consent) {
      alert('Consent to data processing is required');
      return;
    }

    setDealLoading(true);

    try {
      // Mock API call
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/deal-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...dealForm,
          dealId: car.id,
          carTitle: car.title
        }),
      });

      if (response.ok) {
        console.log('Deal intent submitted:', dealForm);
        setDealSubmitted(true);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Deal intent submission error:', error);
      alert('An error occurred. Please try again later.');
    } finally {
      setDealLoading(false);
    }
  };

  const isLeadFormValid = () => {
    return leadForm.name && leadForm.phone && leadForm.email && leadForm.consent;
  };

  const isDealFormValid = () => {
    return dealForm.name && dealForm.phone && dealForm.email && dealForm.consent;
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!user?.profile_completed) {
      if (confirm('You need to complete your profile before applying. Go to profile completion?')) {
        navigate('/dashboard/profile');
      }
      return;
    }

    setApplicationLoading(true);
    setApplicationError('');

    try {
      const api = getApiClient();
      // Use slug if available, otherwise use id
      const lotIdentifier = car.slug || car.id;
      await api.post('/api/applications', null, {
        params: { lot_id: lotIdentifier }
      });

      setApplicationSubmitted(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Application submission error:', error);
      setApplicationError(error.response?.data?.detail || 'Failed to submit application. Please try again later.');
    } finally {
      setApplicationLoading(false);
    }
  };

  return (
    <div id="car-forms" className="space-y-8">
      {/* Apply for Financing - для авторизованных пользователей */}
      {isAuthenticated && user?.profile_completed && (
        <Card className="border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="w-6 h-6" />
              Apply for Financing
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {applicationSubmitted ? (
              <div className="text-center py-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-gray-600">
                  Your financing application has been received. We'll review it and contact you within 24 hours.
                </p>
                <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
              </div>
            ) : (
              <div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">You're Pre-Qualified!</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Based on your credit profile (Score: {user.credit_score}), you qualify for this vehicle.
                        Submit your application to get final approval.
                      </p>
                    </div>
                  </div>
                </div>

                {applicationError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                    {applicationError}
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Vehicle:</span>
                      <p className="font-semibold">{car.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Fleet Price:</span>
                      <p className="font-semibold text-green-600">${car.fleet?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Your Credit Score:</span>
                      <p className="font-semibold">{user.credit_score}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Annual Income:</span>
                      <p className="font-semibold">${user.annual_income?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleApplicationSubmit}
                  disabled={applicationLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
                >
                  {applicationLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By submitting, you authorize us to review your credit profile and contact you about financing options.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Для авторизованных без профиля */}
      {isAuthenticated && !user?.profile_completed && (
        <Card className="border-2 border-orange-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="w-6 h-6" />
              Complete Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-4">
              To apply for financing on this vehicle, please complete your credit profile first.
            </p>
            <Button
              onClick={() => navigate('/dashboard/profile')}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              Complete Profile Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contact Info */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div>📞 Телефон: +1 (747) CARGWIN</div>
          <div>💬 Telegram: @CargwinSupport</div>
          <div>📧 Email: help@cargwin.com</div>
          <div className="mt-4 text-xs text-gray-500">
            Поддержка 24/7 • Ответ в течение 15 минут
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarForms;