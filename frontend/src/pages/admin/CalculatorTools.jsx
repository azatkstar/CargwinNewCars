import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const CalculatorTools = () => {
  const { token } = useAuth();
  const [regenerateStatus, setRegenerateStatus] = useState('idle');
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [testSlug, setTestSlug] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  const handleRegenerateAll = async () => {
    if (!window.confirm('Regenerate calculator configs for all auto-generated offers? This may take a few moments.')) return;
    
    setRegenerateStatus('loading');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/regenerate-calculator-configs`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (res.ok) {
        setRegenerateCount(data.regenerated);
        setRegenerateStatus('success');
      } else {
        setRegenerateStatus('error');
      }
    } catch (error) {
      console.error('Regenerate error:', error);
      setRegenerateStatus('error');
    }
  };

  const handleTestCar = async () => {
    if (!testSlug) return;
    
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/cars/${testSlug}/calculator-config`);
      const data = await res.json();
      setTestResult(data);
    } catch (error) {
      console.error('Test error:', error);
      setTestResult({ error: error.message });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Calculator Tools</h1>
        <p className="text-gray-600">Utilities for managing calculator configurations</p>
      </div>

      <div className="space-y-6">
        {/* Regenerate All */}
        <Card>
          <CardHeader>
            <CardTitle>Regenerate All Calculator Configs</CardTitle>
            <CardDescription>
              Regenerate calculator configurations for all offers with auto-generation enabled.
              This is useful after updating lease/finance programs or tax configs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={handleRegenerateAll} 
                disabled={regenerateStatus === 'loading'}
                className="w-full md:w-auto"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${regenerateStatus === 'loading' ? 'animate-spin' : ''}`} />
                {regenerateStatus === 'loading' ? 'Regenerating...' : 'Regenerate All Configs'}
              </Button>
              
              {regenerateStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-900 font-medium">✅ Success!</p>
                  <p className="text-green-700 text-sm">Regenerated {regenerateCount} calculator config(s)</p>
                </div>
              )}
              
              {regenerateStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-900 font-medium">❌ Error</p>
                  <p className="text-red-700 text-sm">Failed to regenerate configs. Check console for details.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Single Car */}
        <Card>
          <CardHeader>
            <CardTitle>Test Calculator for Single Car</CardTitle>
            <CardDescription>
              Test calculator generation for a specific car by entering its slug or ID.
              This shows you the final calculator configuration that would be used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label>Car Slug or ID</Label>
                  <Input 
                    value={testSlug} 
                    onChange={(e) => setTestSlug(e.target.value)}
                    placeholder="e.g. 2024-lexus-rx350-premium"
                  />
                </div>
                <Button 
                  onClick={handleTestCar} 
                  disabled={!testSlug || testLoading}
                  className="mt-6"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {testLoading ? 'Loading...' : 'Generate Config'}
                </Button>
              </div>
              
              {testResult && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Calculator Configuration</h3>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(testResult, null, 2))}
                    >
                      Copy JSON
                    </Button>
                  </div>
                  <pre className="text-xs overflow-auto max-h-96 bg-white p-3 rounded border">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                  
                  {testResult.lease_available && (
                    <div className="mt-3 p-3 bg-green-50 rounded">
                      <p className="text-sm text-green-900">
                        ✅ Lease available: {testResult.default_lease_term || 36}mo @ {testResult.default_mileage || 10000}mi/yr
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Money Factor: {testResult.money_factor_by_tier?.tier1 || 'N/A'} | Residual: {testResult.residual_percent || 'N/A'}%
                      </p>
                    </div>
                  )}
                  
                  {testResult.finance_available && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <p className="text-sm text-blue-900">
                        ✅ Finance available: {testResult.default_finance_term || 60}mo
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        APR Range: {testResult.apr_by_tier?.tier1 || 'N/A'}% - {testResult.apr_by_tier?.tier4 || 'N/A'}%
                      </p>
                    </div>
                  )}
                  
                  {!testResult.lease_available && !testResult.finance_available && !testResult.error && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded">
                      <p className="text-sm text-yellow-900">⚠️ No matching programs found for this vehicle</p>
                    </div>
                  )}
                  
                  {testResult.error && (
                    <div className="mt-3 p-3 bg-red-50 rounded">
                      <p className="text-sm text-red-900">❌ Error: {testResult.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalculatorTools;