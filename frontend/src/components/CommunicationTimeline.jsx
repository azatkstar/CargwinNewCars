import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mail, MessageSquare, Phone, Clock, CheckCircle } from 'lucide-react';

const CommunicationTimeline = ({ application }) => {
  const events = [
    ...(application.notifications_sent || []).map(n => ({
      type: 'notification',
      icon: n.channel === 'email' ? Mail : MessageSquare,
      title: n.type,
      message: n.message,
      timestamp: n.sent_at,
      color: 'blue'
    })),
    {
      type: 'status',
      icon: CheckCircle,
      title: 'Application Submitted',
      message: `Customer applied for ${application.lot_data?.year} ${application.lot_data?.make}`,
      timestamp: application.created_at,
      color: 'green'
    },
    ...(application.status === 'contacted' ? [{
      type: 'status',
      icon: Phone,
      title: 'Customer Contacted',
      message: application.admin_notes || 'Manager contacted customer',
      timestamp: application.contacted_at,
      color: 'yellow'
    }] : []),
    ...(application.prescoring_data ? [{
      type: 'prescoring',
      icon: CheckCircle,
      title: 'Prescoring Completed',
      message: `${application.prescoring_data.credit_tier} - ${application.prescoring_data.approval_probability} approval probability`,
      timestamp: application.prescoring_data.checked_at,
      color: 'purple'
    }] : [])
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Communication Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

          {events.map((event, idx) => {
            const Icon = event.icon;
            return (
              <div key={idx} className="relative flex gap-4">
                <div className={`w-10 h-10 rounded-full bg-${event.color}-100 flex items-center justify-center flex-shrink-0 z-10`}>
                  <Icon className={`w-5 h-5 text-${event.color}-600`} />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{event.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{event.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunicationTimeline;