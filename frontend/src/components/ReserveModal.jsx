import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, Clock, Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ReserveModal = ({ isOpen, onClose, offer, paymentMode = 'lease' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReserve = async () => {
    // Check if user is logged in
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('access_token');

      // Get payment details based on mode
      const monthlyPayment = paymentMode === 'lease' 
        ? offer.lease?.monthly || 0 
        : calculateFinancePayment(offer);
      
      const dueAtSigning = offer.lease?.dueAtSigning || 3000;

      const response = await fetch(`${BACKEND_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lot_slug: offer.slug || offer.id,
          reserved_price: offer.fleet || offer.msrp,
          monthly_payment: monthlyPayment,
          due_at_signing: dueAtSigning
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(data.detail || 'Failed to reserve price');
      }
    } catch (err) {
      console.error('Reservation error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancePayment = (car) => {
    const price = car.fleet || car.msrp;
    const downPayment = car.finance?.downPayment || 3000;
    const apr = car.finance?.apr || 9.75;
    const term = car.finance?.termMonths || 60;
    
    const principal = price - downPayment;
    const monthlyRate = apr / 100 / 12;
    const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                    (Math.pow(1 + monthlyRate, term) - 1);
    
    return Math.round(payment);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            Reserve This Price
          </DialogTitle>
          <DialogDescription>
            Lock in this exclusive fleet pricing for 48 hours
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Price Reserved!
            </h3>
            <p className="text-gray-600 mb-4">
              Your price is locked for 48 hours. Redirecting to dashboard...
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Price Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">MSRP</span>
                  <span className="line-through text-gray-400">
                    ${offer.msrp?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Your Fleet Price</span>
                  <span className="text-xl font-bold text-red-600">
                    ${offer.fleet?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {paymentMode === 'lease' ? 'Lease' : 'Finance'} Payment
                  </span>
                  <span className="font-semibold">
                    ${paymentMode === 'lease' 
                      ? offer.lease?.monthly 
                      : calculateFinancePayment(offer)}/mo
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {paymentMode === 'lease' ? 'Due at Signing' : 'Down Payment'}
                  </span>
                  <span className="font-semibold">
                    ${(offer.lease?.dueAtSigning || 3000).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Clock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Price locked for <strong>48 hours</strong></span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Lock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Protected from price increases</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>No obligation - cancel anytime</span>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReserve}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Reserving...' : 'Reserve Now'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReserveModal;
