import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { User, FileText, CheckCircle, Clock, XCircle, Settings, Download } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ReferralProgram from '../components/ReferralProgram';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Dashboard = () => {
  const { user, getApiClient, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const api = getApiClient();
      
      // Fetch applications
      const appsResponse = await api.get('/api/applications');
      setApplications(appsResponse.data.applications || []);
      
      // Fetch reservations
      try {
        const resResponse = await api.get('/api/reservations');
        setReservations(resResponse.data.reservations || []);
      } catch (err) {
        console.error('Failed to fetch reservations:', err);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const api = getApiClient();
      const response = await api.get('/api/applications');
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XCircle },
      contacted: { color: 'bg-blue-100 text-blue-800', label: 'Contacted', icon: CheckCircle }
    };
    const { color, label, icon: Icon } = config[status] || config.pending;
    
    return (
      <Badge className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getProgressStep = (status) => {
    const steps = {
      'pending': 1,
      'contacted': 2,
      'approved': 3,
      'contract_sent': 4,
      'completed': 5
    };
    return steps[status] || 1;
  };

  const needsProfileCompletion = !user?.profile_completed;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Manage your car applications and profile</p>
        </div>

        {/* Profile Completion Alert */}
        {needsProfileCompletion && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Complete Your Profile</h3>
                  <p className="text-gray-600 mt-1">
                    Complete your credit profile to get pre-qualified for financing and submit applications.
                  </p>
                  <Button 
                    onClick={() => navigate('/dashboard/profile')}
                    className="mt-3 bg-orange-600 hover:bg-orange-700"
                  >
                    Complete Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{applications.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {applications.filter(a => a.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {applications.filter(a => a.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Reservations */}
        {reservations.filter(r => r.status === 'active').length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Active Reservations</CardTitle>
              <CardDescription>Your reserved prices (valid for 48 hours)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reservations.filter(r => r.status === 'active').map((reservation) => (
                  <div key={reservation.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {reservation.lot_slug?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </h3>
                        <p className="text-sm text-gray-600">Reserved Price: ${reservation.reserved_price?.toLocaleString()}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Reserved
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-600">Monthly Payment:</span>
                        <p className="font-semibold">${reservation.monthly_payment}/mo</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Due at Signing:</span>
                        <p className="font-semibold">${reservation.due_at_signing?.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      Expires: {new Date(reservation.expires_at).toLocaleString()}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        onClick={async () => {
                          const api = getApiClient();
                          const response = await api.post(`/api/reservations/${reservation.id}/convert`);
                          if (response.data.ok) {
                            alert('Successfully converted to application!');
                            fetchData();
                          }
                        }}
                      >
                        Apply for Financing
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (confirm('Cancel this reservation?')) {
                            const api = getApiClient();
                            await api.delete(`/api/reservations/${reservation.id}`);
                            fetchData();
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>My Applications</CardTitle>
            <CardDescription>Track your car financing applications</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No applications yet</p>
                <Button 
                  onClick={() => navigate('/')}
                  className="mt-4"
                  variant="outline"
                >
                  Browse Cars
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Application Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>Application Progress</span>
                        <span>{getProgressStep(app.status)} of 5</span>
                      </div>
                      <div className="flex gap-1">
                        {['pending', 'contacted', 'approved', 'contract_sent', 'completed'].map((step, idx) => (
                          <div
                            key={step}
                            className={`h-2 flex-1 rounded ${
                              getProgressStep(app.status) > idx ? 'bg-green-600' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Submitted</span>
                        <span>Approved</span>
                        <span>Ready</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {app.lot_data?.year} {app.lot_data?.make} {app.lot_data?.model}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Fleet Price: ${app.lot_data?.fleet_price?.toLocaleString() || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied: {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                    
                    {/* Approval Details */}
                    {app.approval_details && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Financing Approved
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {app.approval_details.apr && (
                            <div>
                              <span className="text-gray-600">APR:</span>
                              <p className="font-semibold">{app.approval_details.apr}%</p>
                            </div>
                          )}
                          {app.approval_details.money_factor && (
                            <div>
                              <span className="text-gray-600">Money Factor:</span>
                              <p className="font-semibold">{app.approval_details.money_factor}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">Term:</span>
                            <p className="font-semibold">{app.approval_details.loan_term} months</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Down Payment:</span>
                            <p className="font-semibold">${app.approval_details.down_payment?.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Monthly Payment:</span>
                            <p className="font-semibold text-green-700">${app.approval_details.monthly_payment}/mo</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Approved:</span>
                            <p className="font-semibold text-xs">{new Date(app.approval_details.approved_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        {/* Contract Status */}
                        <div className="mt-3 pt-3 border-t border-green-200">
                          {app.contract_sent ? (
                            <div className="text-sm text-green-700">
                              ✓ Contract sent to your email
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600">
                              Contract will be sent by the bank within 24 hours
                            </div>
                          )}
                        </div>
                        
                        {/* Pickup Section */}
                        {app.pickup_status === 'ready_for_pickup' && !app.pickup_slot && (
                          <Button
                            className="w-full mt-4 bg-green-600 hover:bg-green-700"
                            onClick={() => navigate(`/dashboard/schedule-pickup/${app.id}`)}
                          >
                            Schedule Pickup Time
                          </Button>
                        )}
                        
                        {app.pickup_slot && (
                          <div className="mt-4 p-3 bg-white rounded border border-green-300">
                            <p className="text-sm font-semibold text-green-900">
                              Pickup Scheduled:
                            </p>
                            <p className="text-sm text-gray-700">
                              {new Date(app.pickup_slot).toLocaleString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Location: 2855 Michelle Dr, Irvine, CA 92606 (Office 180)
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Admin Notes */}
                    {app.admin_notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-900">
                          <strong>Note from team:</strong> {app.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Settings Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profile Status</p>
                  <p className="text-sm text-gray-600">
                    {user?.profile_completed ? 'Complete' : 'Incomplete'}
                  </p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/dashboard/profile')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {user?.profile_completed ? 'Edit Profile' : 'Complete Profile'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Center */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Center
            </CardTitle>
            <CardDescription>All your documents in one place</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applications.filter(app => app.status === 'approved').map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">
                      {app.lot_data?.year} {app.lot_data?.make} {app.lot_data?.model}
                    </p>
                    <p className="text-xs text-gray-500">
                      {app.contract_sent ? 'Contract sent to email' : 'Preparing documents...'}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" disabled={!app.contract_sent}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
              {applications.filter(app => app.status === 'approved').length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No documents available yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Referral Program */}
        <div className="mt-6">
          <ReferralProgram />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
