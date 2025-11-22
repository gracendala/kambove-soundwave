import { supabase } from '@/integrations/supabase/client';

// Export the supabase client for use throughout the app
export { supabase };

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to check if user has a specific role
export const hasRole = async (userId: string, role: 'admin' | 'operator') => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', role)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

// Helper function to get user roles
export const getUserRoles = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data?.map(r => r.role) || [];
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
