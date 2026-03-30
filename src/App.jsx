import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// ── Shared Logic Central ───────────────────────────────────────────────────
const isMobile = Capacitor.isNativePlatform() || window.innerWidth < 768;

// ── Public pages ─────────────────────────────────────────────────────────────
import Home from './pages/Home';
import Login from './pages/Login';
import Gallery from './pages/Gallery';
import Onboarding from './pages/Onboarding';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import TestimonialsPage from './pages/TestimonialsPage';

// ── Client Side (Mobile Focus) ───────────────────────────────────────────────
import ClientDashboard from './pages/client/Dashboard';
const ClientFood      = lazy(() => import('./pages/client/Food'));
const ClientScan      = lazy(() => import('./pages/client/Scan'));
const ClientWorkout   = lazy(() => import('./pages/client/Workout'));
const ClientProfile   = lazy(() => import('./pages/client/Profile'));
const ClientProgress  = lazy(() => import('./pages/client/Progress'));
const ClientCheckin   = lazy(() => import('./pages/client/Checkin'));

// ── Trainer Side (Web Focus) ─────────────────────────────────────────────────
const TrainerDashboard    = lazy(() => import('./pages/trainer/Dashboard'));
const TrainerClientList   = lazy(() => import('./pages/trainer/ClientList'));
const TrainerClientDetail = lazy(() => import('./pages/trainer/ClientDetail'));
const TrainerWorkoutList  = lazy(() => import('./pages/trainer/WorkoutList'));
const TrainerWorkoutNew   = lazy(() => import('./pages/trainer/WorkoutBuilder'));

import { useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();
  const path = location.pathname;
  
  // Routes where we want to HIDE the standard marketing Navbar and Footer
  const isInApp = path.startsWith('/dashboard') || 
                  path.startsWith('/food') || 
                  path.startsWith('/scan') || 
                  path.startsWith('/workout') || 
                  path.startsWith('/profile') || 
                  path.startsWith('/progress') || 
                  path.startsWith('/checkin') || 
                  path.startsWith('/trainer') || 
                  path.startsWith('/login');

  return (
    <div className="app-container">
      {!isInApp && <Navbar />}
      
      <main style={{ 
          minHeight: isInApp ? '100vh' : 'calc(100vh - 80px)', 
          paddingTop: isInApp ? '0' : '80px' 
      }}>
        <Suspense fallback={<div className="loader-container"><div className="loader"></div></div>}>
          <Routes>
            {/* Marketing & Public */}
            <Route path="/"           element={<Home />} />
            <Route path="/login"      element={<Login />} />
            <Route path="/gallery"    element={<Gallery />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/features"   element={<FeaturesPage />} />
            <Route path="/pricing"    element={<PricingPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            
            {/* 👤 CLIENT ROUTES */}
            <Route path="/dashboard"        element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />
            <Route path="/food"             element={<ProtectedRoute role="client"><ClientFood /></ProtectedRoute>} />
            <Route path="/scan"             element={<ProtectedRoute role="client"><ClientScan /></ProtectedRoute>} />
            <Route path="/workout"          element={<ProtectedRoute role="client"><ClientWorkout /></ProtectedRoute>} />
            <Route path="/profile"          element={<ProtectedRoute role="client"><ClientProfile /></ProtectedRoute>} />
            <Route path="/progress"         element={<ProtectedRoute role="client"><ClientProgress /></ProtectedRoute>} />
            <Route path="/checkin"          element={<ProtectedRoute role="client"><ClientCheckin /></ProtectedRoute>} />
 
            {/* 👨🏫 TRAINER ROUTES */}
            <Route path="/trainer-dashboard" element={<ProtectedRoute role="trainer"><TrainerDashboard /></ProtectedRoute>} />
            <Route path="/trainer/clients"     element={<ProtectedRoute role="trainer"><TrainerClientList /></ProtectedRoute>} />
            <Route path="/trainer/clients/:id" element={<ProtectedRoute role="trainer"><TrainerClientDetail /></ProtectedRoute>} />
            <Route path="/trainer/workouts"    element={<ProtectedRoute role="trainer"><TrainerWorkoutList /></ProtectedRoute>} />
            <Route path="/trainer/workouts/new" element={<ProtectedRoute role="trainer"><TrainerWorkoutNew /></ProtectedRoute>} />
 
            {/* Fallback */}
            <Route path="/client-dashboard" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      
      {/* Show Footer only for marketing pages and NOT on mobile */}
      {!isInApp && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
