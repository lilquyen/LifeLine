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

// Lấy tất cả các bài đăng (cho tab Tất cả)
export const fetchAllRequests = () => API.get('/rescue-posts');

// Hủy ca cứu (gửi tin nhắn hủy)
export const cancelAssignment = (conversationId: number, content: string) => 
  API.post(`/chat/messages/cancel/${conversationId}`, { content });