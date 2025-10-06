import { supabase } from '../lib/supabase.js';

/**
 * Add email to waitlist
 * @route POST /api/waitlist
 */
export const addToWaitlist = async (req, res) => {
  try {
    const { email, name = '' } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Insert into waitlist table
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        { 
          email: email.toLowerCase().trim(),
          name: name.trim(),
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      // Handle duplicate email error
      if (error.code === '23505') {
        return res.status(200).json({ message: 'You are already on the waitlist!' });
      }
      throw error;
    }

    res.status(201).json({ 
      success: true, 
      message: 'Successfully joined the waitlist!',
      data: data[0]
    });

  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({ 
      error: 'Failed to add to waitlist',
      details: error.message 
    });
  }
};

/**
 * Get all waitlist entries (protected route)
 * @route GET /api/waitlist
 */
export const getWaitlist = async (req, res) => {
  try {
    // Verify admin access (you might want to add proper admin authentication)
    // if (!req.user || !req.user.isAdmin) {
    //   return res.status(403).json({ error: 'Unauthorized' });
    // }

    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ data });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    res.status(500).json({ error: 'Failed to fetch waitlist' });
  }
};
