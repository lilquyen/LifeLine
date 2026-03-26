import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface AssetStatus {
  location: string;
  totalAssets: number;
  readyAssets: number;
  maintenanceAssets: number;
  deployedAssets: number;
  readinessPercentage: number;
  lastMaintenance: string;
}

interface AssetDashboardProps {
  assetStatuses: AssetStatus[];
}

export function AssetDashboard({ assetStatuses }: AssetDashboardProps) {
  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Readiness Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assetStatuses.map((status, index) => (
            <Card key={index} className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{status.location}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Readiness</span>
                  <span className={getStatusColor(status.readinessPercentage)}>
                    {status.readinessPercentage}%
                  </span>
                </div>
                <Progress value={status.readinessPercentage} className="h-2" />
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <Badge variant="secondary">{status.totalAssets}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Ready:</span>
                    <Badge variant="default" className="bg-green-500">{status.readyAssets}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance:</span>
                    <Badge variant="default" className="bg-yellow-500">{status.maintenanceAssets}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Deployed:</span>
                    <Badge variant="default" className="bg-blue-500">{status.deployedAssets}</Badge>
                  </div>
                </div>

                <div className="pt-2 border-t text-xs text-muted-foreground">
                  Last maintenance: {status.lastMaintenance}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}