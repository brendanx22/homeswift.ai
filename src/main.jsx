import React from 'react'
import ReactDOM from 'react-dom/client'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { ThemeProvider } from '@mui/material/styles'
import { AppProvider } from './contexts/AppContext.jsx'
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
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AppProvider>
          <App />
        </AppProvider>
      </ThemeProvider>
    </CacheProvider>
  </React.StrictMode>,
)