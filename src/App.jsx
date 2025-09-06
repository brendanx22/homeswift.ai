import React from 'react';
import HeroSection from './components/hero/HeroSection';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/hero/LandingPage';
import LoginPage from './components/hero/LoginPage';
import SignupPage from './components/hero/SignupPage';
import MainLanding from './components/main/MainLanding';
import PropertyDetails from './PropertyDetails';
import GoogleAuthCallback from './components/auth/GoogleAuthCallback';
import './index.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/main" element={<MainLanding />} />
        <Route path="/property-details" element={<PropertyDetails />} />
        <Route path="/auth/callback" element={<GoogleAuthCallback />} />
      </Routes>
    </Router>
  );
}