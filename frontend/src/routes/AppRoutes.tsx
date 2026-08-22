import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Lazy loaded page views for optimal performance & code splitting
const LandingPage = lazy(() => import('../pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const CitySearch = lazy(() => import('../pages/CitySearch').then((m) => ({ default: m.CitySearch })));
const ActivitySearch = lazy(() => import('../pages/ActivitySearch').then((m) => ({ default: m.ActivitySearch })));
const Community = lazy(() => import('../pages/Community').then((m) => ({ default: m.Community })));
const Calendar = lazy(() => import('../pages/Calendar').then((m) => ({ default: m.Calendar })));
const TravelInsights = lazy(() => import('../pages/TravelInsights').then((m) => ({ default: m.TravelInsights })));
const CreateTrip = lazy(() => import('../pages/CreateTrip').then((m) => ({ default: m.CreateTrip })));
const BuildItinerary = lazy(() => import('../pages/BuildItinerary').then((m) => ({ default: m.BuildItinerary })));
const MyTrips = lazy(() => import('../pages/MyTrips').then((m) => ({ default: m.MyTrips })));
const UserProfile = lazy(() => import('../pages/UserProfile').then((m) => ({ default: m.UserProfile })));
const Dashboard = lazy(() => import('../pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Login = lazy(() => import('../pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('../pages/Register').then((m) => ({ default: m.Register })));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const NotFound = lazy(() => import('../pages/NotFound').then((m) => ({ default: m.NotFound })));

// Subtle branded loading state
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-[#F7F1E5] flex flex-col items-center justify-center p-4">
    <div className="text-center space-y-3">
      <div className="w-10 h-10 border-3 border-[#F4C95D] border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs font-serif font-bold text-[#252525]">GlobeTrotter</p>
      <p className="text-[11px] text-[#6F6A60]">Loading your travel experience...</p>
    </div>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/cities" element={<CitySearch />} />
        <Route path="/destinations" element={<CitySearch />} />
        <Route path="/activities" element={<ActivitySearch />} />
        <Route path="/experiences" element={<ActivitySearch />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/:postId" element={<Community />} />
        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <MyTrips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <TravelInsights />
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
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
