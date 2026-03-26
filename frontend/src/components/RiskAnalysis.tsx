import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface RiskData {
  area: string;
  riskLevel: number;
  incidentCount: number;
  assetAvailability: number;
  responseTime: number;
}

interface IncidentTrend {
  month: string;
  incidents: number;
  resolved: number;
}

interface RiskAnalysisProps {
  riskData: RiskData[];
  incidentTrends: IncidentTrend[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function RiskAnalysis({ riskData, incidentTrends }: RiskAnalysisProps) {
  const pieData = [
    { name: 'Low Risk', value: riskData.filter(d => d.riskLevel <= 3).length, color: '#00C49F' },
    { name: 'Medium Risk', value: riskData.filter(d => d.riskLevel > 3 && d.riskLevel <= 6).length, color: '#FFBB28' },
    { name: 'High Risk', value: riskData.filter(d => d.riskLevel > 6 && d.riskLevel <= 8).length, color: '#FF8042' },
    { name: 'Critical Risk', value: riskData.filter(d => d.riskLevel > 8).length, color: '#FF4444' }
  ];

  const getRiskColor = (level: number) => {
    if (level <= 3) return 'bg-green-500';
    if (level <= 6) return 'bg-yellow-500';
    if (level <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const averageResponseTime = riskData.reduce((acc, curr) => acc + curr.responseTime, 0) / riskData.length;
  const averageAssetAvailability = riskData.reduce((acc, curr) => acc + curr.assetAvailability, 0) / riskData.length;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl text-blue-600">{riskData.length}</div>
              <div className="text-sm text-muted-foreground">Areas Monitored</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl text-orange-600">{averageResponseTime.toFixed(1)} min</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl text-green-600">{averageAssetAvailability.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Asset Availability</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl text-red-600">
                {riskData.reduce((acc, curr) => acc + curr.incidentCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Incidents</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incident Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Trends (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incidentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="incidents" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Total Incidents"
                />
                <Line 
                  type="monotone" 
                  dataKey="resolved" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Resolved"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis by Area */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Analysis by Area</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="riskLevel" fill="#8884d8" name="Risk Level" />
              <Bar dataKey="incidentCount" fill="#82ca9d" name="Incident Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* High Risk Areas Table */}
      <Card>
        <CardHeader>
          <CardTitle>High Risk Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskData
              .filter(area => area.riskLevel > 6)
              .sort((a, b) => b.riskLevel - a.riskLevel)
              .map(area => (
                <div key={area.area} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{area.area}</div>
                    <div className="text-sm text-muted-foreground">
                      {area.incidentCount} incidents • {area.assetAvailability}% asset availability
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getRiskColor(area.riskLevel)}>
                      Risk Level: {area.riskLevel}/10
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {area.responseTime} min avg response
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}