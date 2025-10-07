import express from 'express';
import supabase from '../lib/supabase.js';

const router = express.Router();

// Test Supabase connection
router.get('/test-supabase', async (req, res) => {
  try {
    // Test auth connection
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    
    // Test database connection
    const { data: dbData, error: dbError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (dbError) throw dbError;
    
    res.json({
      success: true,
      auth: { user: authData.user ? 'Authenticated' : 'Not authenticated' },
      database: dbData ? `Connected (${dbData.length} rows)` : 'No data',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Supabase test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.details || 'No additional details available'
    });
  }
});

export default router;
