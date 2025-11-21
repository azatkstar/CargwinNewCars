import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const ViewSSNModal = ({ isOpen, onClose, ssn, clientName }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [showSSN, setShowSSN] = useState(false);
  
  const ADMIN_PASSWORD = 'Cargwin4555!';

  const handleVerify = () => {
    if (password === ADMIN_PASSWORD) {
      setVerified(true);
      setError('');
    } else {
      setError('Incorrect password. Access denied.');
      setPassword('');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setVerified(false);
    setShowSSN(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Lock className="w-5 h-5" />
            View Full SSN - Restricted Access
          </DialogTitle>
        </DialogHeader>

        {!verified ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <p className="font-semibold">Sensitive Information</p>
                  <p>Enter admin password to view {clientName}'s full SSN.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Admin Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                placeholder="Enter password..."
                className={error ? 'border-red-500' : ''}
              />
              {error && (
                <p className="text-xs text-red-600 mt-1">{error}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerify}
                disabled={!password}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Verify & View
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
              <p className="text-sm text-green-700 mb-3">SSN for {clientName}</p>
              <div className="flex items-center justify-center gap-3">
                <div className="text-3xl font-mono font-bold text-gray-900">
                  {showSSN ? ssn : '***-**-' + ssn?.slice(-4)}
                </div>
                <button
                  onClick={() => setShowSSN(!showSSN)}
                  className="p-2 hover:bg-green-100 rounded"
                  title={showSSN ? 'Hide SSN' : 'Show SSN'}
                >
                  {showSSN ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-xs text-red-800">
                <strong>⚠️ Warning:</strong> This information is highly sensitive. 
                Access is logged. Use only for legitimate business purposes.
              </p>
            </div>

            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewSSNModal;
