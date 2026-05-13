import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Thêm token vào header (nếu cần)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Lấy danh sách các bài đăng đang pending (chưa có rescuer nhận)
export const fetchPendingRequests = () => API.get('/rescue-posts/pending');
export const fetchPendingRequestsFiltered = (params: Record<string, any>) => API.get('/rescue-posts/pending', { params });

// Lấy chi tiết một bài đăng theo id
export const fetchRequestDetail = (id: number) => API.get(`/rescue-posts/${id}`);

// Nhận ca cứu hộ
export const assignRequest = (postId: number) => API.post(`/assignments/assign/${postId}`);

// Lấy danh sách các assignment của rescuer hiện tại
export const fetchMyAssignments = () => API.get('/assignments/my');

// Lấy conversation theo requestId
export const getConversationByRequest = (requestId: number) => API.get(`/conversations/request/${requestId}`);

// Cập nhật vị trí của rescuer
export const updateLocation = (lat: number, lng: number) => API.put('/auth/update-location', { latitude: lat, longitude: lng });

export const updateLocationHistory = (requestId: number, lat: number, lng: number) => 
  API.post('/locations/add', { requestId, lat, lng });

// Lấy tất cả các bài đăng (cho tab Tất cả)
export const fetchAllRequests = () => API.get('/rescue-posts');
export const fetchAllRequestsFiltered = (params: Record<string, any>) => API.get('/rescue-posts', { params });

// Hủy ca cứu (gửi tin nhắn hủy)
export const cancelAssignment = (conversationId: number, content: string) => 
  API.post(`/chat/messages/cancel/${conversationId}`, { content });

export const failAssignment = (postId: number, reason?: string) => 
  API.post(`/assignments/fail/${postId}`, { reason });

export const completeAssignment = (postId: number, note?: string) =>
  API.post(`/assignments/complete/${postId}`, { note });

export const fetchLatestRescuerLocation = (requestId: number) =>
  API.get(`/locations/latest/${requestId}`);

export const fetchLocationHistory = (requestId: number) =>
  API.get(`/locations/history/${requestId}`);
