import express from 'express';
import models from './models/index.js';

const app = express();
const PORT = 5001;

app.use(express.json());

// Simple test endpoint
app.get('/api/test', async (req, res) => {
  try {
    // Test database connection
    await models.sequelize.authenticate();
    
    // Test a simple query
    const count = await models.Property.count();
    
    res.json({
      status: 'success',
      database: 'connected',
      propertyCount: count
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Test endpoint: GET /api/test');
});
