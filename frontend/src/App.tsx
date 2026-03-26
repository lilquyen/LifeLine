import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';

// Import các Layout và Dashboard của nhánh Tình nguyện viên
import RescureLayout from './pages/rescuer/RescureLayout';
import RescuerDashboard from './pages/rescuer/RescuerDashboard';

// Tạm thời giữ lại component này cho nhánh Người bị nạn (chúng ta sẽ thay nó sau)
const VictimDashboardTemp = () => <div className="p-10 text-2xl font-bold text-red-600">ĐÂY LÀ TRANG CỦA NGƯỜI BỊ NẠN</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- LUỒNG CHUNG --- */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />

        {/* --- KHU VỰC NGƯỜI BỊ NẠN --- */}
        <Route 
          path="/victim/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['victim']}>
              <VictimDashboardTemp />
            </ProtectedRoute>
          } 
        />

        {/* --- KHU VỰC TÌNH NGUYỆN VIÊN (ĐÃ LẮP GIAO DIỆN FIGMA) --- */}
        {/* Chúng ta dùng RescureLayout làm "bộ khung" bọc bên ngoài */}
        <Route 
          path="/rescuer" 
          element={
            <ProtectedRoute allowedRoles={['rescuer', 'admin']}>
              <RescureLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard sẽ được nhét vào bên trong cái khung Layout đó. 
              URL thực tế sẽ ghép lại thành: /rescuer/dashboard 
          */}
          <Route path="dashboard" element={<RescuerDashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;