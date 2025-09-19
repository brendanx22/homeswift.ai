import { supabase } from '../lib/supabase.js';

/**
 * Delete a user and their associated data
 */
export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const { hardDelete = false } = req.body;

  try {
    // 1. First, verify the user exists and get their email
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // 2. If hard delete is requested, delete from auth.users (admin only)
    if (hardDelete) {
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
      if (deleteAuthError) {
        console.error('Error deleting auth user:', deleteAuthError);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete authentication record',
          code: 'AUTH_DELETE_FAILED',
          error: deleteAuthError.message
        });
      }
    }

    // 3. Delete user from user_profiles table
    const { error: deleteProfileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (deleteProfileError) {
      console.error('Error deleting user profile:', deleteProfileError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user profile',
        code: 'PROFILE_DELETE_FAILED',
        error: deleteProfileError.message
      });
    }

    // 4. Delete any other related data (add more as needed)
    // Example: Delete user's listings, messages, etc.
    // await deleteUserRelatedData(userId);

    return res.json({
      success: true,
      message: `User ${hardDelete ? 'permanently' : 'soft'} deleted successfully`,
      userId
    });

  } catch (error) {
    console.error('Error in deleteUser:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred',
      code: 'SERVER_ERROR',
      error: error.message
    });
  }
};

/**
 * Sync user from auth to user_profiles table
 * This should be called when a new user signs up or when user data changes
 */
export const syncUserProfile = async (userId) => {
  try {
    // 1. Get user from auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser) {
      console.error('Error fetching auth user:', authError);
      throw new Error(authError?.message || 'User not found in auth');
    }

    const userData = {
      id: authUser.id,
      email: authUser.email,
      first_name: authUser.user_metadata?.first_name || '',
      last_name: authUser.user_metadata?.last_name || '',
      email_confirmed_at: authUser.email_confirmed_at,
      last_sign_in_at: authUser.last_sign_in_at,
      created_at: authUser.created_at,
      updated_at: new Date().toISOString()
    };

    // 2. Upsert into user_profiles
    const { error: upsertError } = await supabase
      .from('user_profiles')
      .upsert(userData, { onConflict: 'id' });

    if (upsertError) {
      console.error('Error syncing user profile:', upsertError);
      throw new Error(upsertError.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Error in syncUserProfile:', error);
    throw error;
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*');

    if (error) throw error;

    return res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};
