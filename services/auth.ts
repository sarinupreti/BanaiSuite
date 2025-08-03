import { supabase } from './supabase'
import { User, Role } from '../types';

// TODO: The user role and other profile information will be stored in a separate 'profiles' table.
// For now, we are only handling basic auth.

export const authService = {
  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          // Default role can be set here if needed, e.g., role: 'Site Engineer'
        },
      },
    });
    if (error) throw error;
    return data.user;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error getting session:", error);
        return null;
    }
    if (!session) return null;

    const user = session.user;

    // This is a temporary mapping. Once we have a 'profiles' table,
    // we will fetch the role and other details from there.
    return {
        id: user.id,
        email: user.email,
        name: user.user_metadata.full_name || user.email,
        role: user.user_metadata.role || Role.SITE_ENGINEER, // Temporary default
        avatarUrl: user.user_metadata.avatar_url || '',
    } as User;
  },

  onAuthStateChange(callback) {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        let currentUser: User | null = null;
        if (session?.user) {
             currentUser = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata.full_name || session.user.email,
                role: session.user.user_metadata.role || Role.SITE_ENGINEER,
                avatarUrl: session.user.user_metadata.avatar_url || '',
            };
        }
        callback(currentUser);
    });
    return authListener.subscription;
  }
};
