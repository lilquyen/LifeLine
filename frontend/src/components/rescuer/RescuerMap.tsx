import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const rescuerIcon = L.divIcon({
  className: 'custom-rescuer-icon',
  html: `
    <div
      style="
        background-color: #2563eb; 
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.35);
        overflow: hidden;
      "
    >
      <img 
        src="https://cdn-icons-png.flaticon.com/512/942/942799.png" 
        style="
          width: 24px;
          height: 24px;
          object-fit: contain;
          filter: brightness(0) invert(1);
        "
      />
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

interface Post {
  id: number;
  lat: number;
  lng: number;
  title: string;
  urgencyLevel: number;
  address?: string;
  rescuerName?: string;
}

interface RescuerLocation {
  lat: number;
  lng: number;
  name: string;
}

interface RescuerMapProps {
  posts: Post[];
  rescuerLocation?: RescuerLocation;
  onPostClick?: (postId: number) => void;
}

const MapUpdater = ({
  center,
}: {
  center: [number, number];
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);

  return null;
};

const getPostIcon = (urgencyLevel: number) => {
  const colors = [
    '#3b82f6',
    '#eab308',
    '#f97316',
    '#ef4444',
    '#a855f7',
  ];

  const color =
    colors[urgencyLevel - 1] || '#ef4444';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div
        style="
          background-color: ${color};
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.35);
        "
      >
        ⚠️
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

export const RescuerMap: React.FC<
  RescuerMapProps
> = ({
  posts,
  rescuerLocation,
  onPostClick,
}) => {

  const defaultCenter: [number, number] = [
    10.7769,
    106.7009,
  ];

  const [center, setCenter] =
    useState<[number, number]>(
      defaultCenter
    );

  useEffect(() => {

    if (rescuerLocation) {

      setCenter([
        rescuerLocation.lat,
        rescuerLocation.lng,
      ]);

    } else if (posts.length > 0) {

      setCenter([
        posts[0].lat,
        posts[0].lng,
      ]);
    }

  }, [rescuerLocation, posts]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{
        height: '100%',
        width: '100%',
        zIndex: 1,
      }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      <MapUpdater center={center} />

      {/* Marker các bài cứu hộ */}
      {posts.map((post) => (
        <Marker
          key={post.id}
          position={[
            Number(post.lat),
            Number(post.lng),
          ]}
          icon={getPostIcon(
            post.urgencyLevel
          )}
          eventHandlers={{
            click: () =>
              onPostClick?.(post.id),
          }}
        >
          <Popup>
            <div className="space-y-1 min-w-[180px]">
              <h3 className="font-bold text-red-600">
                {post.title}
              </h3>

              <p className="text-xs text-gray-600">
                Mức độ khẩn cấp:{' '}
                {post.urgencyLevel}
              </p>

              {post.address && (
                <p className="text-xs">
                  {post.address}
                </p>
              )}

              <p className="text-xs">
                {post.rescuerName
                  ? `Đã có người nhận`
                  : 'Chưa có ai nhận'}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Marker rescuer */}
      {rescuerLocation && (
        <Marker
          position={[
            rescuerLocation.lat,
            rescuerLocation.lng,
          ]}
          icon={rescuerIcon}
        >
          <Popup>
            <div className="space-y-1">
              <h3 className="font-bold text-blue-600">
                Vị trí của bạn
              </h3>

              <p className="text-xs">
                {rescuerLocation.name}
              </p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};