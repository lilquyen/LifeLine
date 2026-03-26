import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import các components từ thư mục dùng chung
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { GoogleMapsComponent } from '../../components/GoogleMapsComponent';
import { AssetDashboard } from '../../components/AssetDashboard';
import { AlertSystem } from '../../components/AlertSystem';
import { PersonnelManagement } from '../../components/PersonnelManagement';
import { RiskAnalysis } from '../../components/RiskAnalysis';

// --- Định nghĩa kiểu dữ liệu để tránh lỗi TypeScript ---
interface Alert {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  status: 'new' | 'acknowledged' | 'resolved';
}

interface Incident {
  id: string;
  type: string;
  level: 1 | 2 | 3 | 4 | 5;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: 'active' | 'escalated' | 'resolved';
}

// Giữ lại Mock Data cho các phần chưa có API (Personnel, Assets, Risk)
const mockAssets = [
  { id: '1', name: 'Trạm Cứu hỏa 1', type: 'fire_truck' as const, status: 'ready' as const, lat: 21.0285, lng: 105.8542 },
  { id: '2', name: 'Xe Cấp cứu A', type: 'ambulance' as const, status: 'deployed' as const, lat: 21.0245, lng: 105.8422 },
];

const mockPersonnel = [
  { id: '1', name: 'Nguyễn Văn A', role: 'Đội trưởng', status: 'available' as const, location: 'Hà Nội', specialization: ['Cứu hộ'], contact: '0912345678', lastActive: '5 phút trước' },
];

export default function RescuerDashboard() {
  // --- States ---
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- Gọi API lấy dữ liệu thật từ Backend ---
  useEffect(() => {
    const fetchRescueData = async () => {
      try {
        // Thay cổng 5000 bằng cổng Backend của bạn nếu khác
        const response = await axios.get('http://localhost:5000/api/rescue-posts');
        const dbData = response.data;

        if (Array.isArray(dbData)) {
          // 1. Map dữ liệu cho danh sách Alert
          const mappedAlerts: Alert[] = dbData.map((post: any) => ({
            id: post._id,
            level: post.urgency_level === 'High' ? 4 : (post.urgency_level === 'Medium' ? 3 : 2),
            title: post.title || 'Yêu cầu cứu hộ',
            description: post.content || 'Không có mô tả',
            location: post.address || 'Chưa xác định',
            timestamp: new Date(post.createdAt).toLocaleString('vi-VN'),
            status: post.status === 'Open' ? 'new' : (post.status === 'In Progress' ? 'acknowledged' : 'resolved')
          }));

          // 2. Map dữ liệu cho các điểm trên Bản đồ
          const mappedIncidents: Incident[] = dbData.map((post: any) => ({
            id: post._id,
            type: post.title || 'Sự cố',
            level: post.urgency_level === 'High' ? 4 : 2,
            location: post.address || 'Chưa xác định',
            lat: Number(post.latitude) || 21.0285,
            lng: Number(post.longitude) || 105.8542,
            timestamp: new Date(post.createdAt).toLocaleString('vi-VN'),
            status: post.status === 'Open' ? 'active' : 'resolved'
          }));

          setAlerts(mappedAlerts);
          setIncidents(mappedIncidents);
        }
      } catch (error) {
        console.error("Lỗi kết nối API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRescueData();
  }, []);

  // --- Handlers ---
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
  };

  const activeAlerts = alerts.filter(a => a.status !== 'resolved');
  const criticalCount = activeAlerts.filter(a => a.level >= 4).length;

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu cứu hộ...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Header */}
      <header className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trung tâm Chỉ huy LineLife</h1>
            <p className="text-sm text-gray-600">Hệ thống điều phối khẩn cấp thời gian thực</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-green-700">🟢 Hệ thống Online</Badge>
            <Badge variant="destructive" className={activeAlerts.length > 0 ? "animate-pulse" : ""}>
              {activeAlerts.length} SOS mới
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-6 flex-1 overflow-auto">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="map">Bản đồ</TabsTrigger>
            <TabsTrigger value="alerts">Cảnh báo</TabsTrigger>
            <TabsTrigger value="personnel">Nhân sự</TabsTrigger>
            <TabsTrigger value="assets">Thiết bị</TabsTrigger>
            <TabsTrigger value="analysis">Phân tích</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader><CardTitle>Thống kê nhanh</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between"><span>Sự cố đang mở:</span> <Badge variant="destructive">{activeAlerts.length}</Badge></div>
                  <div className="flex justify-between"><span>Khẩn cấp:</span> <Badge className="bg-red-600">{criticalCount}</Badge></div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader><CardTitle>SOS Khẩn cấp mới nhất</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {activeAlerts.filter(a => a.level >= 4).slice(0, 3).map(alert => (
                    <div key={alert.id} className="flex justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <div className="font-bold text-red-800">{alert.title}</div>
                        <div className="text-xs text-red-600">📍 {alert.location}</div>
                      </div>
                      <Badge variant="destructive">Cấp {alert.level}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Bản đồ điều phối</CardTitle></CardHeader>
              <CardContent>
                <div className="h-96">
                  <GoogleMapsComponent 
                    assets={mockAssets} 
                    incidents={incidents} 
                    onAssetClick={setSelectedAsset} 
                    onIncidentClick={setSelectedIncident} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <div className="h-[600px] border rounded-xl overflow-hidden">
               <GoogleMapsComponent assets={mockAssets} incidents={incidents} onAssetClick={setSelectedAsset} onIncidentClick={setSelectedIncident} />
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <AlertSystem alerts={alerts} onAcknowledge={handleAcknowledgeAlert} onResolve={handleResolveAlert} />
          </TabsContent>

          <TabsContent value="personnel">
            <PersonnelManagement personnel={mockPersonnel} onAssign={() => {}} onUpdateStatus={() => {}} />
          </TabsContent>

          {/* Các tab khác tạm thời để trống hoặc dùng mock component */}
          <TabsContent value="assets">
            <AssetDashboard assetStatuses={[]} />
          </TabsContent>
          
          <TabsContent value="analysis">
            <RiskAnalysis riskData={[]} incidentTrends={[]} />
          </TabsContent>

        </Tabs>
      </div>

      {/* Modal chi tiết sự cố */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full m-4">
            <CardHeader><CardTitle>Chi tiết SOS</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p><strong>Loại:</strong> {selectedIncident.type}</p>
              <p><strong>Vị trí:</strong> {selectedIncident.location}</p>
              <p><strong>Thời gian:</strong> {selectedIncident.timestamp}</p>
              <Button className="w-full" onClick={() => setSelectedIncident(null)}>Đóng</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}