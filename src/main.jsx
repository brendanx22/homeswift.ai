import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { ThemeProvider } from '@emotion/react'
import { AppProvider } from './contexts/AppContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import GlobalStyles from './styles/GlobalStyles.jsx'
import theme from './styles/theme'
import App from './App.jsx'
import './index.css'

// Create a cache for Emotion
const emotionCache = createCache({ 
  key: 'css', 
  prepend: true,
  stylisPlugins: []
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <AuthProvider>
            <AppProvider>
              <App />
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </CacheProvider>
    </BrowserRouter>
  </React.StrictMode>,
)