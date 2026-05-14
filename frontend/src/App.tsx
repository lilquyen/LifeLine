import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';

import VictimLayout from './pages/victim/VictimLayout';
import VictimDashboard from './pages/victim/VictimDashboard';
import CreateRequest from './pages/victim/CreateRequest';
import MyPostsPage from './pages/victim/MyPostsPage';

import RescureLayout from './pages/rescuer/RescureLayout';
import RescuerDashboard from './pages/rescuer/RescuerDashboard';
import RescuerAssignments from './pages/rescuer/RescuerAssignments';
import RescuerAssignmentHistory from './pages/rescuer/RescuerAssignmentHistory';

import ConversationsPage from './pages/chat/MessagePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProfilePage from './pages/profile/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Victim routes */}
        <Route
          path="/victim"
          element={
            <ProtectedRoute allowedRoles={['victim']}>
              <VictimLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/victim/dashboard" replace />} />
          <Route path="dashboard" element={<VictimDashboard />} />
          <Route path="create-request" element={<CreateRequest />} />
          <Route path="my-posts" element={<MyPostsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="conversations" element={<ConversationsPage />} />
          <Route path="conversations/:conversationId" element={<ConversationsPage />} />
        </Route>

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Rescuer routes */}
        <Route
          path="/rescuer"
          element={
            <ProtectedRoute allowedRoles={['rescuer', 'admin']}>
              <RescureLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<RescuerDashboard />} />
          <Route path="assignments" element={<RescuerAssignments />} />
          <Route path="assignment-history" element={<RescuerAssignmentHistory />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="conversations" element={<ConversationsPage />} />
          <Route path="conversations/:conversationId" element={<ConversationsPage />} />
        </Route>

        {/* Test route */}
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
