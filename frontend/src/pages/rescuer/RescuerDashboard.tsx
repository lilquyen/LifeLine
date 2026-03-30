import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 1. Import Types
import { AlertItem } from '../../types'; 

// 2. Import Mock Data (Đã ẩn)
// import { mockAssets, mockPersonnel, mockRiskData, mockIncidentTrends } from '../../lib/mockData';

// 3. Import UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { GoogleMapsComponent } from '../../components/LeafletComponent'; // Bản chất là Leaflet
import { AssetDashboard } from '../../components/AssetDashboard';
import { AlertSystem } from '../../components/AlertSystem';
import { PersonnelManagement } from '../../components/PersonnelManagement';
import { RiskAnalysis } from '../../components/RiskAnalysis';

// Định nghĩa Interface khớp với LeafletComponent
export interface IncidentMapItem {
  id: string;
  type: string;
  level: 1 | 2 | 3 | 4 | 5;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: 'active' | 'escalated' | 'resolved';
}

export default function RescuerDashboard() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [incidents, setIncidents] = useState<IncidentMapItem[]>([]);
  
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy dữ liệu từ Backend
  useEffect(() => {
    const fetchRescueData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/rescue-posts');
        const dbData = response.data;

        if (Array.isArray(dbData)) {
          // 1. Mapped cho danh sách Cảnh báo (AlertSystem)
          const mappedAlerts: AlertItem[] = dbData.map((post: any) => ({
            id: post.id, // Đổi từ _id thành id
            level: Number(post.urgency_level) as 1 | 2 | 3 | 4 | 5 || 2,
            title: post.title || 'Yêu cầu cứu hộ',
            description: post.description || 'Không có mô tả',
            location: post.address || 'Chưa xác định',
            timestamp: new Date(post.created_at).toLocaleString('vi-VN'), // Đổi sang created_at
            status: post.status === 'pending' ? 'new' : (post.status === 'assigned' ? 'acknowledged' : 'resolved')
          }));

          // 2. Mapped cho điểm trên Bản đồ (Leaflet)
          const mappedIncidents: IncidentMapItem[] = dbData.map((post: any) => ({
            id: post.id,
            type: post.title || 'Sự cố',
            level: Number(post.urgency_level) as 1 | 2 | 3 | 4 | 5 || 2,
            location: post.address || 'Chưa xác định',
            lat: Number(post.lat) || 10.7769, // Lấy từ ST_Y
            lng: Number(post.lng) || 106.7009, // Lấy từ ST_X
            timestamp: new Date(post.created_at).toLocaleString('vi-VN'),
            status: post.status === 'pending' ? 'active' : 'resolved' // Map status
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

  // --- Handlers xử lý API ---
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/assignments/assign/${alertId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi tiếp nhận!");
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/assignments/complete/${alertId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a));
      alert("Xác nhận hoàn thành ca cứu hộ!");
    } catch (error: any) {
      alert("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  const handleFailAlert = async (alertId: string) => {
    if (!window.confirm("Giải phóng ca cứu hộ này?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/assignments/fail/${alertId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'new' } : a));
    } catch (error: any) {
      alert("Lỗi khi hủy: " + error.message);
    }
  };

  const activeAlerts = alerts.filter(a => a.status !== 'resolved');
  const criticalCount = activeAlerts.filter(a => a.level >= 4).length;

  if (loading) return <div className="p-10 text-center font-bold">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      <header className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Trung tâm Chỉ huy LineLife</h1>
            <p className="text-sm text-gray-500 italic">Dữ liệu thực tế từ PostgreSQL</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-green-700 font-mono">Cổng 5000 Connected</Badge>
            <Badge variant="destructive" className={activeAlerts.length > 0 ? "animate-pulse" : ""}>
              {activeAlerts.length} SOS CHƯA XỬ LÝ
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-6 flex-1 overflow-auto">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="map">Bản đồ thực tế</TabsTrigger>
            <TabsTrigger value="alerts">Danh sách SOS</TabsTrigger>
            <TabsTrigger value="personnel">Nhân sự</TabsTrigger>
            <TabsTrigger value="assets">Thiết bị</TabsTrigger>
            <TabsTrigger value="analysis">Phân tích</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                  {activeAlerts.filter(a => a.level >= 4).slice(0, 3).map(alert => (
                    <div key={alert.id} className="flex justify-between p-3 bg-red-50 border-l-4 border-l-red-600 rounded">
                      <div>
                        <div className="font-bold">{alert.title}</div>
                        <div className="text-xs text-gray-500">{alert.location}</div>
                      </div>
                      <Badge variant="destructive">Cấp {alert.level}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Bản đồ nhanh ở trang chủ - Thay thế mockAssets bằng mảng rỗng */}
            <Card className="h-[450px]">
               <GoogleMapsComponent 
                assets={[]} 
                incidents={incidents} 
                onIncidentClick={setSelectedIncident} 
               />
            </Card>
          </TabsContent>

          <TabsContent value="map" className="h-[650px] border rounded-xl shadow-lg">
             <GoogleMapsComponent 
              assets={[]} 
              incidents={incidents} 
              onIncidentClick={setSelectedIncident} 
             />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertSystem 
              alerts={alerts} 
              onAcknowledge={handleAcknowledgeAlert} 
              onResolve={handleResolveAlert} 
              onFail={handleFailAlert} 
            />
          </TabsContent>

          <TabsContent value="personnel">
            <PersonnelManagement personnel={[]} onAssign={() => {}} onUpdateStatus={() => {}} />
          </TabsContent>

          <TabsContent value="assets">
            <AssetDashboard assetStatuses={[]} />
          </TabsContent>
          
          <TabsContent value="analysis">
            <RiskAnalysis riskData={[]} incidentTrends={[]} />
          </TabsContent>
        </Tabs>
      </div>

      {selectedIncident && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[2000]">
          <Card className="max-w-md w-full m-4">
            <CardHeader><CardTitle className="text-red-700">Thông tin SOS</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-50 rounded">
                <p><strong>Loại sự cố:</strong> {selectedIncident.type}</p>
                <p><strong>Địa chỉ:</strong> {selectedIncident.location}</p>
                <p><strong>Tọa độ:</strong> {selectedIncident.lat.toFixed(4)}, {selectedIncident.lng.toFixed(4)}</p>
                <p><strong>Gửi lúc:</strong> {selectedIncident.timestamp}</p>
              </div>
              <Button className="w-full" onClick={() => setSelectedIncident(null)}>Đóng chi tiết</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}