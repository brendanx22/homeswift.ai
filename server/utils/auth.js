import supabase from './supabase.js';

export const signUpWithEmail = async (email, password, userData = {}) => {
  try {
    // 1. Sign up the user with email and password
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName || '',
          phone: userData.phone || '',
          // Add any additional user metadata here
        },
        emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
      },
    });

    if (signUpError) throw signUpError;

    // 2. If this is the first user, make them an admin
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const isFirstUser = count === 0;
    const role = isFirstUser ? 'admin' : 'user';

    // 3. Create a profile in the profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: email.toLowerCase(),
        role,
        ...userData,
        updated_at: new Date().toISOString(),
      });

    if (profileError) throw profileError;

    return { user: authData.user, session: authData.session };
  } catch (error) {
    console.error('Error in signUpWithEmail:', error);
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in signInWithEmail:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error in signOut:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    throw error;
  }
};

export const resetPassword = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in resetPassword:', error);
    throw error;
  }
};

export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in updatePassword:', error);
    throw error;
  }
};
