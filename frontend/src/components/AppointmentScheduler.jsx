import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar, Clock, Video } from 'lucide-react';

const AppointmentScheduler = ({ applicationId }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('pickup');

  const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
  const appointmentTypes = [
    { id: 'pickup', label: 'Vehicle Pickup', icon: Calendar },
    { id: 'video', label: 'Video Call', icon: Video },
    { id: 'test_drive', label: 'Test Drive', icon: Clock }
  ];

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select date and time');
      return;
    }

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${BACKEND_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          application_id: applicationId,
          appointment_type: appointmentType,
          date: selectedDate,
          time: selectedTime
        })
      });

      if (response.ok) {
        alert(`${appointmentTypes.find(t => t.id === appointmentType).label} scheduled for ${selectedDate} at ${selectedTime}`);
      }
    } catch (error) {
      alert('Scheduling failed: ' + error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Schedule Appointment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Appointment Type */}
        <div className="grid grid-cols-3 gap-2">
          {appointmentTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setAppointmentType(type.id)}
                className={`p-3 rounded border-2 text-center transition-all ${
                  appointmentType === type.id
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs font-medium">{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Date */}
        <div>
          <label className="text-sm font-medium mb-2 block">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Time */}
        <div>
          <label className="text-sm font-medium mb-2 block">Time</label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select time...</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleSchedule}
          disabled={!selectedDate || !selectedTime}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          Confirm Appointment
        </Button>

        <p className="text-xs text-gray-500 text-center">
          {appointmentType === 'video' && '📹 Video call link will be sent via email'}
          {appointmentType === 'pickup' && '📍 Location: 2855 Michelle Dr, Irvine, CA'}
          {appointmentType === 'test_drive' && '🚗 Test drive at nearest dealer'}
        </p>
      </CardContent>
    </Card>
  );
};

export default AppointmentScheduler;