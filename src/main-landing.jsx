import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainLanding from './components/main/MainLanding.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainLanding />
  </StrictMode>
)


