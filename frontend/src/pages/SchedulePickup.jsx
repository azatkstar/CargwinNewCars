import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SchedulePickup = () => {
  const { applicationId } = useParams();
  const { getApiClient } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const api = getApiClient();
      const response = await api.get('/api/admin/pickup-slots');
      setSlots(response.data.slots || []);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      setError('Failed to load available times');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedSlot) return;

    setSubmitting(true);
    setError('');

    try {
      const api = getApiClient();
      const response = await api.post(`/api/applications/${applicationId}/schedule-pickup`, {
        pickup_slot: selectedSlot
      });

      if (response.data.ok) {
        alert('Pickup time scheduled successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Scheduling error:', err);
      setError(err.response?.data?.detail || 'Failed to schedule pickup');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Your Pickup</h1>
        <p className="text-gray-600 mb-8">Select a convenient time to pick up your vehicle</p>

        {/* Location Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              Pickup Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold">Cargwin LLC</p>
              <p className="text-gray-600">2855 Michelle Dr, Office 180</p>
              <p className="text-gray-600">Irvine, CA 92606</p>
              <p className="text-sm text-gray-500 mt-3">
                📞 Phone: +1 (747) CARGWIN
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              Available Times
            </CardTitle>
            <CardDescription>
              Select a time slot for vehicle pickup
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {slots.slice(0, 20).map((slot) => (
                    <button
                      key={slot.datetime}
                      onClick={() => setSelectedSlot(slot.datetime)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedSlot === slot.datetime
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-sm">{slot.display}</span>
                      </div>
                      {selectedSlot === slot.datetime && (
                        <CheckCircle2 className="w-5 h-5 text-red-600 mt-2" />
                      )}
                    </button>
                  ))}
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSchedule}
                    disabled={!selectedSlot || submitting}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {submitting ? 'Scheduling...' : 'Confirm Pickup Time'}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  * Please arrive 15 minutes early with valid ID and proof of insurance
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default SchedulePickup;
