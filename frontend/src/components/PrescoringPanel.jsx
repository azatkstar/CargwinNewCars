import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Shield, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const PrescoringPanel = ({ applicationId, prescoring, onRunPrescoring }) => {
  const [loading, setLoading] = useState(false);

  const handleRunPrescoring = async () => {
    setLoading(true);
    try {
      await onRunPrescoring();
    } finally {
      setLoading(false);
    }
  };

  if (!prescoring) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <Shield className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Prescoring Not Run</h3>
            <p className="text-sm text-gray-600 mb-4">
              Run prescoring to see customer's credit profile and approval probability
            </p>
            <Button
              onClick={handleRunPrescoring}
              disabled={loading}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {loading ? 'Running...' : 'Run Prescoring'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Mock integration - 700credit/eLAND API pending
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTierColor = (tier) => {
    if (tier.includes('1')) return 'bg-green-100 text-green-800';
    if (tier.includes('2')) return 'bg-blue-100 text-blue-800';
    if (tier.includes('3')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getApprovalIcon = (prob) => {
    if (prob === 'High') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (prob === 'Medium') return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Prescoring Results
        </CardTitle>
        <p className="text-xs text-gray-500 mt-1">
          Checked: {new Date(prescoring.checked_at).toLocaleString()} by {prescoring.checked_by}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600 mb-1">Credit Score</div>
            <div className="text-2xl font-bold">{prescoring.credit_score}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600 mb-1">Credit Tier</div>
            <Badge className={getTierColor(prescoring.credit_tier)}>
              {prescoring.credit_tier}
            </Badge>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              Approval Probability
              {getApprovalIcon(prescoring.approval_probability)}
            </div>
            <div className="text-xl font-bold">{prescoring.approval_probability}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600 mb-1">Payment History</div>
            <div className="font-semibold">{prescoring.payment_history}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600 mb-1">DTI Ratio</div>
            <div className="font-semibold">{(prescoring.debt_to_income_ratio * 100).toFixed(0)}%</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600 mb-1">Open Accounts</div>
            <div className="font-semibold">{prescoring.open_accounts}</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Recommendations:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Max Approved Amount:</span>
              <span className="font-bold">${prescoring.max_approved_amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Recommended Down Payment:</span>
              <span className="font-bold">${prescoring.recommended_down_payment?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {prescoring.notes && (
          <div className="mt-3 text-xs text-gray-500 italic">
            Note: {prescoring.notes}
          </div>
        )}
        
        <Button
          onClick={handleRunPrescoring}
          disabled={loading}
          variant="outline"
          size="sm"
          className="mt-4 w-full"
        >
          {loading ? 'Refreshing...' : 'Refresh Prescoring'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PrescoringPanel;