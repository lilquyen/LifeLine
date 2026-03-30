import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

// --- CHÚ Ý QUAN TRỌNG: Import từ file types dùng chung ---
// Dựa vào ảnh cấu trúc thư mục, từ components lùi ra 1 cấp (..) là thấy thư mục types
import { AlertItem, ALERT_LEVELS } from '../types'; 

// Chỉ giữ lại Props riêng cho Component này
interface AlertSystemProps {
  alerts: AlertItem[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onFail: (id: string) => void;
}

export function AlertSystem({ alerts, onAcknowledge, onResolve, onFail }: AlertSystemProps) {
  const activeAlerts = alerts.filter(alert => alert.status !== 'resolved');
  const criticalAlerts = activeAlerts.filter(alert => alert.level >= 4);

  return (
    <div className="space-y-4">
      {/* Alert Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Alert System Overview
            <Badge variant="destructive" className="animate-pulse">
              {activeAlerts.length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(ALERT_LEVELS).map(([level, config]) => {
              const count = activeAlerts.filter(alert => alert.level === parseInt(level)).length;
              return (
                <div key={level} className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full ${config.color} flex items-center justify-center text-white mb-2`}>
                    {count}
                  </div>
                  <div className="text-sm font-medium">Level {level}</div>
                  {/* SỬA 1: config.name -> config.label */}
                  <div className="text-xs text-muted-foreground">{config.label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertDescription className="text-red-700 font-semibold flex items-center gap-2">
            <span>⚠️</span> 
            {criticalAlerts.length} Critical alert(s) require immediate attention!
          </AlertDescription>
        </Alert>
      )}

      {/* Active Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeAlerts.map(alert => {
              // Lấy config từ ALERT_LEVELS (đã được import)
              const levelConfig = ALERT_LEVELS[alert.level as keyof typeof ALERT_LEVELS];
              
              return (
                <div key={alert.id} className="border rounded-lg p-4 space-y-3 bg-card shadow-sm">
                  <div className="flex items-start justify-between">
                    
                    {/* Thông tin chính của Alert */}
                    <div className="space-y-2 flex-1 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${levelConfig.color} border-none`}>
                          {/* SỬA 2: levelConfig.name -> levelConfig.label */}
                          Level {alert.level} - {levelConfig.label}
                        </Badge>
                        <Badge variant={alert.status === 'new' ? 'destructive' : 'secondary'}>
                          {alert.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <h4 className="text-base font-bold mt-1">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {alert.description || 'Không có mô tả chi tiết'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">📍 {alert.location || 'Chưa cập nhật'}</span>
                        <span className="flex items-center gap-1">🕒 {alert.timestamp || 'Chưa rõ'}</span>
                      </div>
                    </div>
                    
                    {/* Các nút hành động */}
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      {alert.status === 'new' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                          onClick={() => onAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      {alert.status === 'acknowledged' && (
                        <div className="flex flex-col gap-2 w-full">
                          <Button 
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => onResolve(alert.id)}
                          >
                            Resolve (Thành công)
                          </Button>
                          
                          <Button 
                            size="sm"
                            variant="outline"
                            className="w-full border-red-600 text-red-600 hover:bg-red-50"
                            onClick={() => onFail(alert.id)} // <--- Nút mới đây
                          >
                            Cứu hộ thất bại
                          </Button>
                        </div>
                      )}
                    </div>
                    
                  </div>
                  
                  {/* SỬA 3: levelConfig.textColor -> levelConfig.text và XÓA description vì trong type bạn định nghĩa không có */}
                  <div className={`text-xs border-t pt-2 mt-2 ${levelConfig.text}`}>
                    <span className="font-semibold">Trạng thái:</span> Yêu cầu chú ý mức độ {levelConfig.label}
                  </div>
                  
                </div>
              );
            })}
            
            {/* Trạng thái trống (Empty State) */}
            {activeAlerts.length === 0 && (
              <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed">
                <span className="text-4xl mb-2 block">✅</span>
                <p className="text-muted-foreground font-medium">All clear! No active alerts at this time.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}