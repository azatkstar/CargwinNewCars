import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Shield, TrendingUp, Users, DollarSign, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import PrescoringPanel from '../../components/PrescoringPanel';
import CopyToFleetButton from '../../components/CopyToFleetButton';
import NotificationHistory from '../../components/NotificationHistory';

const FinanceManagerDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, needs_prescore, high_prob, low_prob
  const [selectedApp, setSelectedApp] = useState(null);
  const { getApiClient } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const api = getApiClient();
      const response = await api.get('/api/admin/applications');
      let apps = response.data.applications || [];
      
      // Apply filters
      if (filter === 'needs_prescore') {
        apps = apps.filter(a => !a.prescoring_data);
      } else if (filter === 'high_prob') {
        apps = apps.filter(a => a.prescoring_data?.approval_probability === 'High');
      } else if (filter === 'low_prob') {
        apps = apps.filter(a => a.prescoring_data?.approval_probability === 'Low');
      }
      
      setApplications(apps);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const runPrescoring = async (appId) => {
    try {
      const api = getApiClient();
      const response = await api.post(`/api/applications/${appId}/prescoring`);
      if (response.data.ok) {
        alert('Prescoring completed!');
        fetchApplications();
      }
    } catch (error) {
      alert('Prescoring failed: ' + (error.response?.data?.detail || error.message));
    }
  };

  const stats = {
    total: applications.length,
    needsPrescoring: applications.filter(a => !a.prescoring_data).length,
    highProb: applications.filter(a => a.prescoring_data?.approval_probability === 'High').length,
    lowProb: applications.filter(a => a.prescoring_data?.approval_probability === 'Low').length
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Finance Manager Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage applications, prescoring, and alternatives</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Prescoring</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.needsPrescoring}</p>
              </div>
              <Shield className="w-10 h-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Approval</p>
                <p className="text-3xl font-bold text-green-600">{stats.highProb}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Approval</p>
                <p className="text-3xl font-bold text-red-600">{stats.lowProb}</p>
              </div>
              <DollarSign className="w-10 h-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Applications</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="needs_prescore">Needs Prescoring</SelectItem>
                <SelectItem value="high_prob">High Approval Prob</SelectItem>
                <SelectItem value="low_prob">Low Approval Prob</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map(app => (
              <Card key={app.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {app.user_data?.name || 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-600">{app.user_data?.email}</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {app.lot_data?.year} {app.lot_data?.make} {app.lot_data?.model}
                      </p>
                    </div>
                    <Badge className={
                      app.prescoring_data?.approval_probability === 'High' ? 'bg-green-100 text-green-800' :
                      app.prescoring_data?.approval_probability === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      app.prescoring_data?.approval_probability === 'Low' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {app.prescoring_data?.approval_probability || 'Not Scored'}
                    </Badge>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mb-4">
                    {!app.prescoring_data && (
                      <Button
                        size="sm"
                        onClick={() => runPrescoring(app.id)}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        🔍 Run Prescoring
                      </Button>
                    )}
                    <CopyToFleetButton application={app} user={app.user_data} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                    >
                      {selectedApp?.id === app.id ? 'Hide Details' : 'View Details'}
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {selectedApp?.id === app.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* Prescoring */}
                      {app.prescoring_data ? (
                        <PrescoringPanel 
                          applicationId={app.id}
                          prescoring={app.prescoring_data}
                          onRunPrescoring={() => runPrescoring(app.id)}
                        />
                      ) : (
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                          <p className="text-sm text-yellow-900">
                            Prescoring not run yet. Click "Run Prescoring" to see credit details.
                          </p>
                        </div>
                      )}
                      
                      {/* Employment Details */}
                      <Card className="bg-gray-50">
                        <CardHeader>
                          <CardTitle className="text-sm">Employment & Income</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-gray-600">Employer:</span>
                              <p className="font-medium">{app.user_data?.employer_name || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Job Title:</span>
                              <p className="font-medium">{app.user_data?.job_title || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Employment Type:</span>
                              <p className="font-medium">{app.user_data?.employment_type || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Time at Job:</span>
                              <p className="font-medium">{app.user_data?.time_at_job_months || 'N/A'} months</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Monthly Income (Pre-tax):</span>
                              <p className="font-medium">${(app.user_data?.monthly_income_pretax || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Annual Income:</span>
                              <p className="font-medium">${(app.user_data?.annual_income || 0).toLocaleString()}</p>
                            </div>
                            {app.verified_income && (
                              <div className="col-span-2 bg-green-50 p-2 rounded">
                                <span className="text-gray-600">✓ Verified Income:</span>
                                <p className="font-bold text-green-700">${app.verified_income.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Trade-In */}
                      {app.trade_in && (
                        <Card className="bg-blue-50">
                          <CardHeader>
                            <CardTitle className="text-sm">Trade-In Vehicle</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-gray-600">Vehicle:</span>
                                <p className="font-medium">
                                  {app.trade_in.year} {app.trade_in.make} {app.trade_in.model}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">VIN:</span>
                                <p className="font-medium">{app.trade_in.vin}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Mileage:</span>
                                <p className="font-medium">{app.trade_in.mileage?.toLocaleString()} miles</p>
                              </div>
                              <div>
                                <span className="text-gray-600">KBB Value:</span>
                                <p className="font-bold text-blue-700">${app.trade_in.kbb_value?.toLocaleString()}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {/* Manager Comments */}
                      {app.manager_comments && (
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                          <p className="text-sm font-medium text-yellow-900 mb-1">Manager Comments:</p>
                          <p className="text-sm text-gray-700">{app.manager_comments}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {applications.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No applications match this filter
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceManagerDashboard;
