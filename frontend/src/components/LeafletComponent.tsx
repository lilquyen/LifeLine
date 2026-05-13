import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Badge } from './ui/badge';
import React from 'react';

// Sửa lỗi hiển thị icon của Leaflet trong React
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Icon cho người bị nạn (Victim) - màu đỏ
const victimIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #ef4444; width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">🆘</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -20]
});

// Icon cho người cứu hộ (Rescuer) - màu xanh
const rescuerIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #3b82f6; width: 35px; height: 35px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">🚑</div>`,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -17]
});

// Icon cho điểm lịch sử của rescuer - màu xanh nhạt hơn
const rescuerHistoryIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #60a5fa; width: 25px; height: 25px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 1px 5px rgba(0,0,0,0.2);">📍</div>`,
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -12]
});

interface Incident {
  id: string;
  type: string;
  level?: 1 | 2 | 3 | 4 | 5;
  title?: string;
  location?: string;
  lat: number;
  lng: number;
  timestamp?: string;
  status?: 'active' | 'resolved' | 'escalated' | 'victim' | 'rescuer';
}

interface GoogleMapsComponentProps {
  incidents?: Incident[];
  route?: Array<{lat: number; lng: number}>;
  onIncidentClick?: (incident: Incident) => void;
  center?: { lat: number; lng: number };
}

// Component phụ để tự động căn giữa bản đồ
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng]);
  return null;
}

export function GoogleMapsComponent({ incidents = [], route = [], onIncidentClick, center }: GoogleMapsComponentProps) {
  const defaultCenter: [number, number] = [10.7769, 106.7009];
  
  // Tìm điểm trung tâm (ưu tiên victim đầu tiên hoặc center truyền vào)
  let mapCenter = defaultCenter;
  const victimPoint = incidents.find(i => i.status === 'victim');
  if (center) {
    mapCenter = [center.lat, center.lng];
  } else if (victimPoint) {
    mapCenter = [victimPoint.lat, victimPoint.lng];
  }

  // Lấy icon dựa vào status
  const getIcon = (incident: Incident) => {
    if (incident.status === 'victim') {
      return victimIcon;
    } else if (incident.status === 'rescuer' && incident.id?.toString().includes('current')) {
      return rescuerIcon;
    } else if (incident.status === 'rescuer') {
      return rescuerHistoryIcon;
    }
    return victimIcon; // fallback
  };

  // Format popup content
  const getPopupContent = (incident: Incident) => {
    if (incident.status === 'victim') {
      return (
        <div className="p-2 min-w-[150px]">
          <h4 className="font-bold text-red-600 flex items-center gap-1">
            <span>🆘</span> NẠN NHÂN
          </h4>
          <p className="text-sm font-semibold mt-1">{incident.title || incident.type}</p>
          <p className="text-xs text-gray-500 mt-1">{incident.location}</p>
          {incident.level && (
            <Badge className="mt-1 bg-red-500 text-white text-xs">Cấp độ {incident.level}</Badge>
          )}
        </div>
      );
    } else if (incident.status === 'rescuer') {
      const isCurrent = incident.id?.toString().includes('current');
      return (
        <div className="p-2 min-w-[150px]">
          <h4 className="font-bold text-blue-600 flex items-center gap-1">
            <span>🚑</span> {isCurrent ? 'CỨU HỘ VIÊN (HIỆN TẠI)' : 'CỨU HỘ VIÊN'}
          </h4>
          <p className="text-sm">{incident.title || 'Đang hỗ trợ'}</p>
          {incident.timestamp && (
            <p className="text-xs text-gray-500 mt-1">⏰ {new Date(incident.timestamp).toLocaleTimeString('vi-VN')}</p>
          )}
          {isCurrent && <Badge className="mt-1 bg-green-500 text-white text-xs">Đang hoạt động</Badge>}
        </div>
      );
    }
    return <div className="p-2">{incident.title || incident.type}</div>;
  };

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden border">
      <MapContainer 
        center={mapCenter} 
        zoom={14} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Căn giữa bản đồ theo điểm victim */}
        {victimPoint && <RecenterMap lat={victimPoint.lat} lng={victimPoint.lng} />}

        {/* Vẽ đường đi của rescuer */}
        {route && route.length > 1 && (
          <Polyline
            positions={route.map(point => [point.lat, point.lng])}
            pathOptions={{
              color: '#3b82f6',
              weight: 4,
              opacity: 0.7,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
        )}

        {/* Render các điểm trên bản đồ */}
        {incidents.map((incident, index) => (
          <Marker 
            key={`${incident.id}-${index}`} 
            position={[incident.lat, incident.lng]}
            icon={getIcon(incident)}
            eventHandlers={{
              click: () => onIncidentClick?.(incident),
            }}
          >
            <Popup>
              {getPopupContent(incident)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Badge hiển thị góc bản đồ */}
      <div className="absolute bottom-4 left-4 z-[1000] flex gap-2">
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md text-xs flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <span>Nạn nhân</span>
        </div>
        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md text-xs flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Cứu hộ viên</span>
        </div>
        {route && route.length > 1 && (
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md text-xs flex items-center gap-2">
            <div className="w-6 h-0.5 bg-blue-500"></div>
            <span>Đường đi</span>
          </div>
        )}
      </div>
    </div>
  );
}