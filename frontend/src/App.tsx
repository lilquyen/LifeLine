import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';

import VictimLayout from './pages/victim/VictimLayout';
import CreateRequest from './pages/victim/CreateRequest';
import MyPostsPage from './pages/victim/MyPostsPage';

import RescureLayout from './pages/rescuer/RescureLayout';
import RescuerDashboard from './pages/rescuer/RescuerDashboard';

import TestUI from './pages/TestUI';

const VictimDashboardTemp = () => (
  <div className="p-10 text-2xl font-bold text-red-600">
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {}
        <Route
          path="/victim"
          element={
            <ProtectedRoute allowedRoles={['victim']}>
              <VictimLayout />
            </ProtectedRoute>
          }
        >
          {}
          <Route path="dashboard" element={<VictimDashboardTemp />} />
          <Route path="create-request" element={<CreateRequest />} />
          <Route path="my-posts" element={<MyPostsPage />} />
        </Route>

        {}
        <Route
          path="/rescuer"
          element={
            <ProtectedRoute allowedRoles={['rescuer', 'admin']}>
              <RescureLayout />
            </ProtectedRoute>
          }
        >
          {}
          <Route path="dashboard" element={<RescuerDashboard />} />
        </Route>

        {}
        <Route path="/test-ui" element={<TestUI />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;