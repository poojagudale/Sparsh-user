import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Protected customer pages
import CustomerHome from './pages/CustomerHome';
import Profile from './pages/Profile';
import CustomerServiceView from './pages/services/CustomerServiceView';
import Bookings from './pages/Bookings';
import BookingNew from './pages/BookingNew';
import BookingDetail from './pages/BookingDetail';

// Layout & Route Guards
import FooterTabs from './components/FooterTabs';
import PrivateRoute from './components/PrivateRoute';

/**
 * Sparsh Customer Frontend Application Routing
 *
 * Public  : /  /login  /signup
 * Customer: /home  /profile  /services_view (/services)  /bookings (/bookings/new, /bookings/:id)
 * Aliases : /search -> /home, /booking -> /bookings
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public Routes ────────────────────────────────────────── */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── Customer Protected Routes ────────────────────────────── */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <CustomerHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/services_view"
          element={
            <PrivateRoute>
              <CustomerServiceView />
            </PrivateRoute>
          }
        />
        <Route
          path="/services"
          element={
            <PrivateRoute>
              <CustomerServiceView />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <PrivateRoute>
              <Bookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings/new"
          element={
            <PrivateRoute>
              <BookingNew />
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <PrivateRoute>
              <BookingDetail />
            </PrivateRoute>
          }
        />

        {/* ── Legacy route aliases (backward compatibility) ────────── */}
        <Route
          path="/search"
          element={
            <PrivateRoute>
              <CustomerHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <PrivateRoute>
              <Bookings />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* FooterTabs renders on customer pages and hides on public routes */}
      <FooterTabs />
    </Router>
  );
}

export default App;

