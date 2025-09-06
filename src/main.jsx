import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import MainLanding from './components/main/MainLanding.jsx'
import LoginPage from './components/hero/LoginPage.jsx'
import SignupPage from './components/hero/SignupPage.jsx'
import AuthCallback from './components/auth/AuthCallback.jsx'
import Listings from './Listings.jsx'
import PropertyDetails from './PropertyDetails.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/main" element={<MainLanding />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
      </Routes>
    </Router>
  </StrictMode>
)