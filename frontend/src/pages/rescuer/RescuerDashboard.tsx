import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 1. Import Types
import { AlertItem } from '../../types'; 

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { GoogleMapsComponent } from '../../components/LeafletComponent'; // Bản chất là Leaflet
import { AssetDashboard } from '../../components/AssetDashboard';
import { AlertSystem } from '../../components/AlertSystem';
import { PersonnelManagement } from '../../components/PersonnelManagement';
import { RiskAnalysis } from '../../components/RiskAnalysis';

import { DashboardOverview } from '../../components/rescuer/DashboardOverview';
import { IncidentDetailModal } from '../../components/rescuer/InciedentDetailModal';


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

  if (loading) return <div className="p-10 text-center font-bold text-red-600 animate-pulse">Đang kết nối hệ thống chỉ huy...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      <header className="bg-white border-b p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Trung tâm Cứu trợ LineLife</h1>
            <p className="text-sm text-gray-500 italic font-medium">Real-time PostgreSQL Data Stream</p>
          </div>
          <Badge variant="destructive" className={activeAlerts.length > 0 ? "animate-pulse px-4 py-1" : ""}>
            {activeAlerts.length} SOS ĐANG HOẠT ĐỘNG
          </Badge>
        </div>
      </header>

      <div className="p-6 flex-1 overflow-auto">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-100 p-1">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="map">Bản đồ thực tế</TabsTrigger>
            <TabsTrigger value="alerts">Danh sách SOS</TabsTrigger>
            <TabsTrigger value="personnel">Nhân sự</TabsTrigger>
            <TabsTrigger value="assets">Thiết bị</TabsTrigger>
            <TabsTrigger value="analysis">Phân tích</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500">
            {/* Sử dụng Component đã tách */}
            <DashboardOverview alerts={alerts} />

            <Card className="h-[450px] overflow-hidden border-2 border-white shadow-lg rounded-xl">
               <GoogleMapsComponent 
                assets={[]} 
                incidents={incidents} 
                onIncidentClick={setSelectedIncident} 
               />
            </Card>
          </TabsContent>

          <TabsContent value="map" className="h-[70vh] border rounded-xl shadow-lg overflow-hidden">
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
          
          {/* Các tab khác giữ nguyên... */}
        </Tabs>
      </div>

      {/* Sử dụng Modal đã tách */}
      <IncidentDetailModal 
        incident={selectedIncident} 
        onClose={() => setSelectedIncident(null)} 
      />
    </div>
  );
}