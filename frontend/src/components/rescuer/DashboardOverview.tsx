import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertItem } from '../../types';

interface OverviewProps {
  alerts: AlertItem[];
}

export const DashboardOverview: React.FC<OverviewProps> = ({ alerts }) => {
  const activeAlerts = alerts.filter(a => a.status !== 'resolved');
  const criticalAlerts = activeAlerts.filter(a => a.level >= 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader><CardTitle>Trạng thái</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between font-semibold">
            <span>Đang chờ:</span> 
            <Badge variant="destructive">{activeAlerts.filter(a => a.status === 'new').length}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Đang tiếp nhận:</span> 
            <Badge className="bg-blue-500">{activeAlerts.filter(a => a.status === 'acknowledged').length}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Ca khẩn cấp (Level 4-5)</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          {criticalAlerts.slice(0, 3).map(alert => (
            <div key={alert.id} className="flex justify-between p-3 bg-red-50 border-l-4 border-l-red-600 rounded">
              <div>
                <div className="font-bold">{alert.title}</div>
                <div className="text-xs text-gray-500">{alert.location}</div>
              </div>
              <Badge variant="destructive">Cấp {alert.level}</Badge>
            </div>
          ))}
          {criticalAlerts.length === 0 && <p className="text-gray-400 text-sm italic">Hiện không có ca khẩn cấp.</p>}
        </CardContent>
      </Card>
    </div>
  );
};