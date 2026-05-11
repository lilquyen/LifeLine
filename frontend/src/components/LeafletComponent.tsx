import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

// --- Interfaces giữ nguyên ---
interface Asset {
  id: string;
  name: string;
  type: 'fire_truck' | 'ambulance' | 'rescue' | 'command';
  status: 'ready' | 'maintenance' | 'unavailable' | 'deployed';
  lat: number;
  lng: number;
}

interface Incident {
  id: string;
  type: string;
  level: 1 | 2 | 3 | 4 | 5;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: 'active' | 'resolved' | 'escalated';
}

interface GoogleMapsComponentProps {
  assets: Asset[];
  incidents: Incident[];
  onAssetClick?: (asset: Asset) => void;
  onIncidentClick?: (incident: Incident) => void;
}

// Component phụ để tự động căn giữa bản đồ
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng]);
  return null;
}

export function GoogleMapsComponent({ assets, incidents, onAssetClick, onIncidentClick }: GoogleMapsComponentProps) {
  const defaultCenter: [number, number] = [10.7769, 106.7009];

  const getIncidentIcon = (level: number) => {
    const colors = ['#3b82f6', '#eab308', '#f97316', '#ef4444', '#a855f7'];
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${colors[level - 1]}; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);" class="animate-pulse">⚠️</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden border">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {incidents.length > 0 && (
          <RecenterMap lat={incidents[0].lat} lng={incidents[0].lng} />
        )}

        {/* Render Sự cố */}
        {incidents.map((incident) => (
          <Marker 
            key={incident.id} 
            position={[incident.lat, incident.lng]}
            icon={getIncidentIcon(incident.level)}
          >
            <Popup>
              <div className="p-1">
                <h4 className="font-bold">{incident.type}</h4>
                <p>{incident.location}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Thiết bị */}
        {assets.map((asset) => (
          <Marker 
            key={asset.id} 
            position={[asset.lat, asset.lng]}
            eventHandlers={{
              click: () => onAssetClick?.(asset),
            }}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold">{asset.name}</p>
                <p className="text-xs text-blue-600">{asset.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Badge hiển thị góc bản đồ */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Badge variant="secondary" className="bg-white/90 text-gray-700 shadow-md">
          📍 Hệ thống bản đồ cứu hộ OSM
        </Badge>
      </div>
    </div>
  );
}