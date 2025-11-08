import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { User, FileText, CheckCircle, Clock, XCircle, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
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
                    <div className="flex items-start justify-between">
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
                        {app.admin_notes && (
                          <p className="text-sm text-blue-600 mt-2 italic">
                            Note: {app.admin_notes}
                          </p>
                        )}
                      </div>
                      <div>
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
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
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
