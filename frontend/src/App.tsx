import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import VictimLayout from './pages/victim/VictimLayout';
import CreateRequest from './pages/victim/CreateRequest';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/victim" element={
          <ProtectedRoute allowedRoles={['victim']}>
            <VictimLayout />
          </ProtectedRoute>
        }>
          <Route path="create-request" element={<CreateRequest />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;