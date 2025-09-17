// src/styles/theme.js
export const theme = {
  colors: {
    primary: '#4CAF50',
    primaryDark: '#45a049',
    secondary: '#2196F3',
    error: '#f44336',
    text: '#333',
    lightText: '#666',
    background: '#fff',
    lightBackground: '#f5f5f5',
    border: '#e0e0e0',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    large: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  },
  transitions: {
    default: 'all 0.2s ease-in-out',
  },
};

export default theme;
