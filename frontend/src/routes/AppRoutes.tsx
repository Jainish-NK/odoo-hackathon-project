import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { CitySearch } from '../pages/CitySearch';
import { ActivitySearch } from '../pages/ActivitySearch';
import { CreateTrip } from '../pages/CreateTrip';
import { BuildItinerary } from '../pages/BuildItinerary';
import { MyTrips } from '../pages/MyTrips';
import { UserProfile } from '../pages/UserProfile';
import { Dashboard } from '../pages/Dashboard';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { NotFound } from '../pages/NotFound';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/cities" element={<CitySearch />} />
      <Route path="/destinations" element={<CitySearch />} />
      <Route path="/activities" element={<ActivitySearch />} />
      <Route path="/experiences" element={<ActivitySearch />} />
      <Route
        path="/trips"
        element={
          <ProtectedRoute>
            <MyTrips />
          </ProtectedRoute>
        }
      />
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
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};



