import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
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
      setError('Incorrect password');
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
            View Full SSN
          </DialogTitle>
        </DialogHeader>

        {!verified ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-sm text-yellow-900">Enter password to view {clientName}'s SSN</p>
              </div>
            </div>

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="Admin password..."
            />
            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
              <Button onClick={handleVerify} disabled={!password} className="flex-1 bg-red-600">Verify</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-300 rounded p-6 text-center">
              <p className="text-sm text-green-700 mb-3">SSN for {clientName}</p>
              <div className="flex items-center justify-center gap-3">
                <div className="text-3xl font-mono font-bold">
                  {showSSN ? ssn : '***-**-' + ssn?.slice(-4)}
                </div>
                <button onClick={() => setShowSSN(!showSSN)} className="p-2 hover:bg-green-100 rounded">
                  {showSSN ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-xs text-red-800">⚠️ Access logged. Use only for legitimate business.</p>
            </div>

            <Button onClick={handleClose} variant="outline" className="w-full">Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewSSNModal;