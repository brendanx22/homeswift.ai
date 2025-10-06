import React, { useEffect, useState } from 'react';
import apiClient from '../lib/apiClient';

const TestConnection = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/health');
        setData(response.data);
        setError(null);
      } catch (err) {
        setError({
          message: err.message, 
          response: err.response?.data,
          status: err.response?.status,
        });
        console.error('Connection error:', err);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1>Backend Connection Test</h1>
      
      <div style={{
        margin: '2rem 0',
        padding: '1.5rem',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ marginTop: 0 }}>Test Results</h3>
        
        {loading ? (
          <div>Testing connection to backend...</div>
        ) : error ? (
          <div style={{ color: '#e03131' }}>
            <p><strong>❌ Connection failed</strong></p>
            <p><strong>Error:</strong> {error.message}</p>
            {error.status && <p><strong>Status:</strong> {error.status}</p>}
            {error.response && (
              <div>
                <p><strong>Response:</strong></p>
                <pre style={{
                  backgroundColor: '#fff',
                  padding: '1rem',
                  borderRadius: '4px',
                  overflowX: 'auto'
                }}>
                  {JSON.stringify(error.response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: '#2b8a3e' }}>
            <p><strong>✅ Connection successful!</strong></p>
            <p><strong>Endpoint:</strong> {data?.endpoint || 'N/A'}</p>
            <p><strong>Status:</strong> {data?.status || 'N/A'}</p>
            <p><strong>Timestamp:</strong> {data?.timestamp || 'N/A'}</p>
            {data && (
              <div style={{ marginTop: '1rem' }}>
                <p><strong>Full Response:</strong></p>
                <pre style={{
                  backgroundColor: '#fff',
                  padding: '1rem',
                  borderRadius: '4px',
                  overflowX: 'auto'
                }}>
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#e7f5ff',
        borderRadius: '8px',
        border: '1px solid #d0ebff'
      }}>
        <h3 style={{ marginTop: 0 }}>Connection Details</h3>
        <p><strong>Frontend URL:</strong> {window.location.origin}</p>
        <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'Not set'}</p>
        <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#fff3bf',
        borderRadius: '8px',
        border: '1px solid #ffd43b'
      }}>
        <h3 style={{ marginTop: 0 }}>Troubleshooting</h3>
        <ol>
          <li>Check if the backend is running at <code>{import.meta.env.VITE_API_BASE_URL}</code></li>
          <li>Verify CORS is configured to allow requests from <code>{window.location.origin}</code></li>
          <li>Check the browser's Network tab (F12) for failed requests</li>
          <li>Look for any error messages in the browser console (F12)</li>
          <li>Ensure your backend is properly handling OPTIONS requests for CORS preflight</li>
        </ol>
      </div>
    </div>
  );
};

export default TestConnection;
