import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Listings from './Listings.jsx'
import PropertyDetails from './PropertyDetails.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
      </Routes>
    </Router>
  </StrictMode>
)