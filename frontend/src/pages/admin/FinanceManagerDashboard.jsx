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
                  {selectedApp?.id === app.id && app.prescoring_data && (
                    <div className="mt-4 pt-4 border-t">
                      <PrescoringPanel 
                        applicationId={app.id}
                        prescoring={app.prescoring_data}
                        onRunPrescoring={() => runPrescoring(app.id)}
                      />
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
