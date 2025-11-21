import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../hooks/useAuth';

const BrokerApplicationsAdmin = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
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
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Car:</span>
                    <p className="font-medium">{app.desired_cars}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment:</span>
                    <p className="font-medium">${app.expected_payment}/mo</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Income:</span>
                    <p className="font-medium">${app.monthly_income_pretax}/mo</p>
                  </div>
                </div>
                
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-600">Full Details</summary>
                  <div className="mt-3 p-4 bg-gray-50 rounded text-sm space-y-1">
                    <div><strong>Employer:</strong> {app.employer}</div>
                    <div><strong>Address:</strong> {app.current_address}</div>
                    <div><strong>Down:</strong> ${app.down_payment_comfortable} - ${app.down_payment_max}</div>
                  </div>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrokerApplicationsAdmin;
