import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BrokerApplication = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    desired_cars: '',
    color_preferences: '',
    financing_type: '',
    expected_payment: '',
    email: '',
    date_of_birth: '',
    drivers_license: '',
    employer: '',
    job_title: '',
    employer_address: '',
    time_at_job_months: '',
    income_type: '',
    monthly_income_pretax: '',
    employer_phone: '',
    additional_income: '',
    immigration_status: '',
    current_address: '',
    alternative_vehicles: '',
    previous_address: '',
    phone: '',
    has_cosigner: false,
    down_payment_comfortable: '',
    down_payment_max: '',
    signature_name: '',
    ssn: '',
    consent_credit_check: false,
    consent_contact: false
  });

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
      const endpoint = BACKEND_URL.endsWith('/api')
        ? `${BACKEND_URL}/broker-application`
        : `${BACKEND_URL}/api/broker-application`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      alert('Error submitting application: ' + error.message);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-32 text-center">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Application Submitted!</h1>
          <p className="text-xl text-gray-600 mb-8">
            We'll review your application and contact you within 24 hours.
          </p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Broker Credit Application</h1>
          <p className="text-gray-600">Complete application for external brokers</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(step => (
              <div key={step} className={`h-2 flex-1 rounded ${step <= currentStep ? 'bg-red-600' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6">
              
              {/* Step 1: Personal & Vehicle */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg mb-4">Personal Information & Vehicle Preference</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name *</Label>
                      <Input required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Desired Cars (Brand-Model) *</Label>
                    <Input required value={formData.desired_cars} onChange={e => setFormData({...formData, desired_cars: e.target.value})} placeholder="e.g., Toyota Camry, Honda Accord" />
                  </div>
                  
                  <div>
                    <Label>Color & Options Preferences *</Label>
                    <Textarea required rows={3} value={formData.color_preferences} onChange={e => setFormData({...formData, color_preferences: e.target.value})} placeholder="Light exterior, dark interior, adaptive cruise, etc." />
                  </div>
                  
                  <div>
                    <Label>Financing Type *</Label>
                    <Select value={formData.financing_type} onValueChange={v => setFormData({...formData, financing_type: v})}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lease">Lease</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="help">Help me decide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Expected Monthly Payment *</Label>
                    <Input type="number" required value={formData.expected_payment} onChange={e => setFormData({...formData, expected_payment: e.target.value})} placeholder="e.g., 500" />
                  </div>
                </div>
              )}

              {/* Step 2: Contact & ID */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg mb-4">Contact & Identification</h3>
                  
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  
                  <div>
                    <Label>Phone Number *</Label>
                    <Input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(XXX) XXX-XXXX" />
                  </div>
                  
                  <div>
                    <Label>Date of Birth *</Label>
                    <Input type="date" required value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} />
                  </div>
                  
                  <div>
                    <Label>Driver License Number *</Label>
                    <Input required value={formData.drivers_license} onChange={e => setFormData({...formData, drivers_license: e.target.value})} />
                  </div>
                </div>
              )}

              {/* Step 3: Employment */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg mb-4">Employment Information</h3>
                  
                  <div>
                    <Label>Current Employer *</Label>
                    <Input required value={formData.employer} onChange={e => setFormData({...formData, employer: e.target.value})} />
                  </div>
                  
                  <div>
                    <Label>Job Title *</Label>
                    <Input required value={formData.job_title} onChange={e => setFormData({...formData, job_title: e.target.value})} />
                  </div>
                  
                  <div>
                    <Label>Employer Address</Label>
                    <Input value={formData.employer_address} onChange={e => setFormData({...formData, employer_address: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Time at Job (months) *</Label>
                      <Input type="number" required value={formData.time_at_job_months} onChange={e => setFormData({...formData, time_at_job_months: e.target.value})} />
                    </div>
                    <div>
                      <Label>Employer Phone</Label>
                      <Input value={formData.employer_phone} onChange={e => setFormData({...formData, employer_phone: e.target.value})} />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Income Type *</Label>
                    <Select value={formData.income_type} onValueChange={v => setFormData({...formData, income_type: v})}>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1099">1099 (transfers, cash, Zelle)</SelectItem>
                        <SelectItem value="W2">W2 (paychecks, official employment)</SelectItem>
                        <SelectItem value="self_employed">Self-employed</SelectItem>
                        <SelectItem value="unknown">Don't know</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Monthly Income (before taxes) *</Label>
                    <Input type="number" required value={formData.monthly_income_pretax} onChange={e => setFormData({...formData, monthly_income_pretax: e.target.value})} placeholder="e.g., 5000" />
                  </div>
                  
                  <div>
                    <Label>Additional Income (if any)</Label>
                    <Input type="number" value={formData.additional_income} onChange={e => setFormData({...formData, additional_income: e.target.value})} />
                  </div>
                </div>
              )}

              {/* Step 4: Address & Status */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg mb-4">Residence & Status</h3>
                  
                  <div>
                    <Label>Immigration Status *</Label>
                    <Select value={formData.immigration_status} onValueChange={v => setFormData({...formData, immigration_status: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="citizen">US Citizen</SelectItem>
                        <SelectItem value="green_card">Green Card</SelectItem>
                        <SelectItem value="asylum">Asylum</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Current Address *</Label>
                    <Input required value={formData.current_address} onChange={e => setFormData({...formData, current_address: e.target.value})} />
                  </div>
                  
                  <div>
                    <Label>Previous Address (if at current less than 2 years)</Label>
                    <Input value={formData.previous_address} onChange={e => setFormData({...formData, previous_address: e.target.value})} />
                  </div>
                  
                  <div>
                    <Label>Alternative Vehicles (list) *</Label>
                    <Textarea required rows={3} value={formData.alternative_vehicles} onChange={e => setFormData({...formData, alternative_vehicles: e.target.value})} placeholder="e.g., Lexus ES, BMW 3 Series, Audi A4" />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="cosigner" checked={formData.has_cosigner} onCheckedChange={c => setFormData({...formData, has_cosigner: c})} />
                    <label htmlFor="cosigner" className="text-sm cursor-pointer">I have a co-signer</label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Comfortable Down Payment *</Label>
                      <Input type="number" required value={formData.down_payment_comfortable} onChange={e => setFormData({...formData, down_payment_comfortable: e.target.value})} />
                    </div>
                    <div>
                      <Label>Maximum Down Payment *</Label>
                      <Input type="number" required value={formData.down_payment_max} onChange={e => setFormData({...formData, down_payment_max: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Signature & Consent */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg mb-4">Signature & Consent</h3>
                  
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      I authorize the lender to obtain credit reports and verify information. I certify all information is true and accurate.
                    </p>
                  </div>
                  
                  <div>
                    <Label>Signature (type your full name) *</Label>
                    <Input required value={formData.signature_name} onChange={e => setFormData({...formData, signature_name: e.target.value})} placeholder="John Doe" />
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      Social Security Number *
                      <button
                        type="button"
                        onClick={() => {
                          const ssnInput = document.getElementById('ssn-input');
                          ssnInput.type = ssnInput.type === 'password' ? 'text' : 'password';
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {'{'}Show/Hide{'}'}
                      </button>
                    </Label>
                    <Input 
                      id="ssn-input"
                      type="password" 
                      required 
                      maxLength="11" 
                      value={formData.ssn} 
                      onChange={e => setFormData({...formData, ssn: e.target.value})} 
                      placeholder="XXX-XX-XXXX"
                      className="font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ✓ Your SSN is encrypted and secure. Click "Show/Hide" to verify your entry.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="consent1" checked={formData.consent_credit_check} onCheckedChange={c => setFormData({...formData, consent_credit_check: c})} />
                      <label htmlFor="consent1" className="text-sm cursor-pointer">
                        I authorize credit check and verification of information provided. *
                      </label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox id="consent2" checked={formData.consent_contact} onCheckedChange={c => setFormData({...formData, consent_contact: c})} />
                      <label htmlFor="consent2" className="text-sm cursor-pointer">
                        I consent to be contacted by dealer/lender via phone, text, or email. I have read and agree to the Privacy Policy. *
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-4 mt-8">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={handlePrev} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                  </Button>
                )}
                
                {currentStep < totalSteps ? (
                  <Button type="button" onClick={handleNext} className="flex-1 bg-red-600 hover:bg-red-700">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={!formData.consent_credit_check || !formData.consent_contact} className="flex-1 bg-green-600 hover:bg-green-700">
                    Submit Application
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default BrokerApplication;