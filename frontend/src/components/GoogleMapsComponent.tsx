import { useEffect, useRef, useState } from 'react';
import { Badge } from './ui/badge';

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

export function GoogleMapsComponent({ assets, incidents, onAssetClick, onIncidentClick }: GoogleMapsComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  // Mock Google Maps implementation
  useEffect(() => {
    if (!mapRef.current) return;

    // Simulate Google Maps initialization
    const mockMap = {
      center: { lat: -6.9175, lng: 107.6191 }, // Bandung coordinates
      zoom: 12
    };

    setMap(mockMap);
  }, []);

  const getAssetColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'unavailable': return 'bg-red-500';
      case 'deployed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getIncidentColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-orange-500';
      case 4: return 'bg-red-500';
      case 5: return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'fire_truck': return '🚒';
      case 'ambulance': return '🚑';
      case 'rescue': return '🚨';
      case 'command': return '🏢';
      default: return '📍';
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Mock Google Maps container */}
      <div 
        ref={mapRef} 
        className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 relative"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d1d5db' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        {/* Map title overlay */}
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="secondary" className="bg-white/90 text-gray-700">
            📍 Kota Bandung - Emergency Command Center
          </Badge>
        </div>

        {/* Asset markers */}
        {assets.map((asset, index) => (
          <div
            key={asset.id}
            className={`absolute w-10 h-10 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${getAssetColor(asset.status)} hover:scale-110 transition-transform`}
            style={{
              left: `${20 + (index % 5) * 15}%`,
              top: `${25 + Math.floor(index / 5) * 20}%`
            }}
            onClick={() => onAssetClick?.(asset)}
            title={`${asset.name} - ${asset.status}`}
          >
            <span className="text-white text-sm">{getAssetIcon(asset.type)}</span>
          </div>
        ))}

        {/* Incident markers */}
        {incidents.map((incident, index) => (
          <div
            key={incident.id}
            className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${getIncidentColor(incident.level)} hover:scale-110 transition-transform animate-pulse`}
            style={{
              left: `${60 + (index % 4) * 10}%`,
              top: `${30 + Math.floor(index / 4) * 25}%`
            }}
            onClick={() => onIncidentClick?.(incident)}
            title={`${incident.type} - Level ${incident.level}`}
          >
            <span className="text-white text-xs">⚠️</span>
          </div>
        ))}

        {/* Map controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button className="bg-white p-2 rounded shadow hover:bg-gray-50">+</button>
          <button className="bg-white p-2 rounded shadow hover:bg-gray-50">−</button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-lg">
        <h4 className="mb-2">Legend</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Ready Assets</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Active Incidents</span>
          </div>
        </div>
      </div>
    </div>
  );
}