import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { CreateTrip } from '../pages/CreateTrip';
import { BuildItinerary } from '../pages/BuildItinerary';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route
        path="/trips/create"
        element={
          <ProtectedRoute>
            <CreateTrip />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:tripId/itinerary"
        element={
          <ProtectedRoute>
            <BuildItinerary />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
