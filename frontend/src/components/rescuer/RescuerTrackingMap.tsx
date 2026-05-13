import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Point {
  lat: number;
  lng: number;
}

interface RescuerTrackingMapProps {
  victim?: Point | null;
  rescuer?: Point | null;
}

const trackingIcon = (label: string, color: string) => L.divIcon({
  className: 'rescuer-tracking-marker',
  html: `<div style="width:36px;height:36px;border-radius:999px;background:${color};color:white;border:3px solid white;box-shadow:0 8px 20px rgba(15,23,42,.25);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;">${label}</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function FitMap({ victim, rescuer }: RescuerTrackingMapProps) {
  const map = useMap();

  useEffect(() => {
    if (victim && rescuer) {
      map.fitBounds(
        [
          [Number(victim.lat), Number(victim.lng)],
          [Number(rescuer.lat), Number(rescuer.lng)],
        ],
        { padding: [48, 48], maxZoom: 15 }
      );
    } else if (victim) {
      map.setView([Number(victim.lat), Number(victim.lng)], 14);
    } else if (rescuer) {
      map.setView([Number(rescuer.lat), Number(rescuer.lng)], 14);
    }
  }, [map, victim, rescuer]);

  return null;
}

export function RescuerTrackingMap({ victim, rescuer }: RescuerTrackingMapProps) {
  const [route, setRoute] = useState<Point[]>([]);

  useEffect(() => {
    if (!victim || !rescuer) {
      setRoute([]);
      return;
    }

    const controller = new AbortController();
    const rescuerLat = Number(rescuer.lat);
    const rescuerLng = Number(rescuer.lng);
    const victimLat = Number(victim.lat);
    const victimLng = Number(victim.lng);

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${rescuerLng},${rescuerLat};${victimLng},${victimLat}?overview=full&geometries=geojson`,
      { signal: controller.signal }
    )
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Route request failed')))
      .then((data) => {
        const coordinates = data?.routes?.[0]?.geometry?.coordinates;
        if (!Array.isArray(coordinates)) {
          setRoute([]);
          return;
        }

        setRoute(coordinates.map(([lng, lat]: [number, number]) => ({ lat, lng })));
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error(error);
          setRoute([]);
        }
      });

    return () => controller.abort();
  }, [victim, rescuer]);

  const center: [number, number] = victim
    ? [Number(victim.lat), Number(victim.lng)]
    : rescuer
    ? [Number(rescuer.lat), Number(rescuer.lng)]
    : [10.7769, 106.7009];

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', minHeight: 320, width: '100%', zIndex: 1 }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitMap victim={victim} rescuer={rescuer} />
      {victim && (
        <Marker position={[Number(victim.lat), Number(victim.lng)]} icon={trackingIcon('NAN', '#dc2626')} />
      )}
      {rescuer && (
        <Marker position={[Number(rescuer.lat), Number(rescuer.lng)]} icon={trackingIcon('BAN', '#2563eb')} />
      )}
      {route.length > 0 ? (
        <Polyline
          positions={route.map(point => [Number(point.lat), Number(point.lng)])}
          pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.85 }}
        />
      ) : victim && rescuer ? (
        <Polyline
          positions={[
            [Number(victim.lat), Number(victim.lng)],
            [Number(rescuer.lat), Number(rescuer.lng)],
          ]}
          pathOptions={{ color: '#2563eb', weight: 4, dashArray: '8 8' }}
        />
      ) : null}
    </MapContainer>
  );
}
