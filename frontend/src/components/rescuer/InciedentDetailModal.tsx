import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { IncidentMapItem } from '../../pages/rescuer/RescuerDashboard';

interface ModalProps {
  incident: IncidentMapItem | null;
  onClose: () => void;
}

export const IncidentDetailModal: React.FC<ModalProps> = ({ incident, onClose }) => {
  if (!incident) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader><CardTitle className="text-red-700 font-bold">Thông tin SOS Chi Tiết</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="mb-2"><strong>Loại sự cố:</strong> {incident.type}</p>
            <p className="mb-2"><strong>Địa chỉ:</strong> {incident.location}</p>
            <p className="mb-2"><strong>Tọa độ:</strong> {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}</p>
            <p><strong>Gửi lúc:</strong> {incident.timestamp}</p>
          </div>
          <Button className="w-full bg-slate-900 hover:bg-slate-800" onClick={onClose}>Đóng chi tiết</Button>
        </CardContent>
      </Card>
    </div>
  );
};