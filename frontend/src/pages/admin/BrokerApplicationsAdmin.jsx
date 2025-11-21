import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import ViewSSNModal from '../../components/ViewSSNModal';
import { useAuth } from '../../hooks/useAuth';

const BrokerApplicationsAdmin = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSSN, setSelectedSSN] = useState(null);
  const [showSSNModal, setShowSSNModal] = useState(false);
  const { getApiClient } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const api = getApiClient();
      const response = await api.get('/admin/broker-applications');
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Failed to fetch broker applications:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Broker Applications</h1>
        <p className="text-gray-600">External broker credit applications</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{app.first_name} {app.last_name}</CardTitle>
                    <p className="text-sm text-gray-600">{app.email}</p>
                  </div>
                  <Badge>{app.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-600">Desired Car:</span>
                    <p className="font-medium">{app.desired_cars}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Financing:</span>
                    <p className="font-medium">{app.financing_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Expected Payment:</span>
                    <p className="font-medium">${app.expected_payment}/mo</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Monthly Income:</span>
                    <p className="font-medium">${app.monthly_income_pretax}/mo</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Income Type:</span>
                    <p className="font-medium">{app.income_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Submitted:</span>
                    <p className="font-medium">{new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {/* FULL DETAILS - Always visible */}
                <div className="bg-gray-50 border rounded-lg p-4 space-y-3 text-sm">
                  <h4 className="font-bold text-gray-900 mb-3">Complete Application Data</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-gray-700 mb-2">Personal</h5>
                      <div className="space-y-1">
                        <div><strong>Name:</strong> {app.first_name} {app.last_name}</div>
                        <div><strong>Email:</strong> {app.email}</div>
                        <div><strong>Phone:</strong> {app.phone}</div>
                        <div><strong>DOB:</strong> {app.date_of_birth}</div>
                        <div><strong>DL#:</strong> {app.drivers_license}</div>
                        <div className="flex items-center gap-2">
                          <strong>SSN:</strong> 
                          <span>***-**-{app.ssn?.slice(-4) || 'N/A'}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSSN({ ssn: app.ssn, name: `${app.first_name} ${app.last_name}` });
                              setShowSSNModal(true);
                            }}
                            className="ml-2 text-xs"
                          >
                            View Full SSN
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-gray-700 mb-2">Vehicle Preferences</h5>
                      <div className="space-y-1">
                        <div><strong>Desired:</strong> {app.desired_cars}</div>
                        <div><strong>Colors/Options:</strong> {app.color_preferences}</div>
                        <div><strong>Alternatives:</strong> {app.alternative_vehicles}</div>
                        <div><strong>Financing:</strong> {app.financing_type}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <h5 className="font-semibold text-gray-700 mb-2">Employment</h5>
                      <div className="space-y-1">
                        <div><strong>Employer:</strong> {app.employer}</div>
                        <div><strong>Job Title:</strong> {app.job_title}</div>
                        <div><strong>Employer Address:</strong> {app.employer_address || 'N/A'}</div>
                        <div><strong>Employer Phone:</strong> {app.employer_phone || 'N/A'}</div>
                        <div><strong>Time at Job:</strong> {app.time_at_job_months} months</div>
                        <div><strong>Income Type:</strong> {app.income_type}</div>
                        <div><strong>Additional Income:</strong> ${app.additional_income || 0}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-gray-700 mb-2">Residence & Financial</h5>
                      <div className="space-y-1">
                        <div><strong>Immigration:</strong> {app.immigration_status}</div>
                        <div><strong>Current Address:</strong> {app.current_address}</div>
                        <div><strong>Previous Address:</strong> {app.previous_address || 'N/A'}</div>
                        <div><strong>Co-signer:</strong> {app.has_cosigner ? 'Yes' : 'No'}</div>
                        <div><strong>Down Payment:</strong> ${app.down_payment_comfortable} - ${app.down_payment_max}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <h5 className="font-semibold text-gray-700 mb-2">Signature & Consent</h5>
                    <div><strong>Signed by:</strong> {app.signature_name}</div>
                    <div><strong>Credit Check:</strong> {app.consent_credit_check ? '✅ Authorized' : '❌ Not authorized'}</div>
                    <div><strong>Contact:</strong> {app.consent_contact ? '✅ Consented' : '❌ No consent'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* SSN Modal */}
      <ViewSSNModal
        isOpen={showSSNModal}
        onClose={() => setShowSSNModal(false)}
        ssn={selectedSSN?.ssn}
        clientName={selectedSSN?.name}
      />
    </div>
  );
};

export default BrokerApplicationsAdmin;
