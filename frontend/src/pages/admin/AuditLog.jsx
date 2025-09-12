import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { FileText } from 'lucide-react';

const AuditLog = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Журнал аудита</h1>
        <p className="text-gray-600 mt-1">История действий пользователей</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Лог действий
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Журнал аудита в разработке
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLog;