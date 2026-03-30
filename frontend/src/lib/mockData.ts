// File: src/lib/mockData.ts

export const mockAssets = [
  { id: '1', name: 'Trạm Cứu hỏa 1', type: 'fire_truck' as const, status: 'ready' as const, lat: 21.0285, lng: 105.8542 },
  { id: '2', name: 'Xe Cấp cứu A', type: 'ambulance' as const, status: 'deployed' as const, lat: 21.0245, lng: 105.8422 },
];

export const mockPersonnel = [
  { id: '1', name: 'Nguyễn Văn A', role: 'Đội trưởng', status: 'available' as const, location: 'Hà Nội', specialization: ['Cứu hộ'], contact: '0912345678', lastActive: '5 phút trước' },
];

export const mockRiskData = [
  { area: 'Hoàn Kiếm', riskLevel: 8, incidentCount: 12, assetAvailability: 75, responseTime: 8.5 },
  { area: 'Đống Đa', riskLevel: 6, incidentCount: 8, assetAvailability: 85, responseTime: 6.2 },
];

export const mockIncidentTrends = [
  { month: 'Tháng 1', incidents: 25, resolved: 23 },
  { month: 'Tháng 2', incidents: 28, resolved: 26 },
  { month: 'Tháng 3', incidents: 22, resolved: 21 },
];