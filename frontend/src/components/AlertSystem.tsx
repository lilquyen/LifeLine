import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

interface AlertItem {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  status: 'new' | 'acknowledged' | 'resolved';
}

interface AlertSystemProps {
  alerts: AlertItem[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

const ALERT_LEVELS = {
  1: { name: 'Minor', color: 'bg-blue-500', textColor: 'text-blue-700', description: 'Dampak minimal, dapat dikendalikan secara internal' },
  2: { name: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-700', description: 'Mulai signifikan, membutuhkan koordinasi lintas tim' },
  3: { name: 'Major', color: 'bg-orange-500', textColor: 'text-orange-700', description: 'Dampak besar, membutuhkan sumber daya eksternal' },
  4: { name: 'Critical', color: 'bg-red-500', textColor: 'text-red-700', description: 'Darurat skala besar, ancaman terhadap keselamatan publik' },
  5: { name: 'National Disaster', color: 'bg-purple-500', textColor: 'text-purple-700', description: 'Krisis meluas, ancaman nasional' }
};

export function AlertSystem({ alerts, onAcknowledge, onResolve }: AlertSystemProps) {
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
                  <div className="text-sm">Level {level}</div>
                  <div className="text-xs text-muted-foreground">{config.name}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertDescription className="text-red-700">
            ⚠️ {criticalAlerts.length} Critical alert(s) require immediate attention!
          </AlertDescription>
        </Alert>
      )}

      {/* Active Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeAlerts.map(alert => {
              const levelConfig = ALERT_LEVELS[alert.level];
              return (
                <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={levelConfig.color}>
                          Level {alert.level} - {levelConfig.name}
                        </Badge>
                        <Badge variant={alert.status === 'new' ? 'destructive' : 'secondary'}>
                          {alert.status}
                        </Badge>
                      </div>
                      <h4 className="text-base font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>📍 {alert.location}</span>
                        <span>🕒 {alert.timestamp}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {alert.status === 'new' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      {alert.status === 'acknowledged' && (
                        <Button 
                          size="sm"
                          onClick={() => onResolve(alert.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    {levelConfig.description}
                  </div>
                </div>
              );
            })}
            
            {activeAlerts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                ✅ No active alerts at this time
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}