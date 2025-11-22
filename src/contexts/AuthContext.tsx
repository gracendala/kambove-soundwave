import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, getUserRoles, signOut } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userRoles: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user roles when authenticated
        if (session?.user) {
          setTimeout(async () => {
            try {
              const roles = await getUserRoles(session.user.id);
              setUserRoles(roles);
            } catch (error) {
              console.error('Error fetching user roles:', error);
              setUserRoles([]);
            }
          }, 0);
        } else {
          setUserRoles([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const roles = await getUserRoles(session.user.id);
          setUserRoles(roles);
        } catch (error) {
          console.error('Error fetching user roles:', error);
          setUserRoles([]);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      const roles = await getUserRoles(data.user.id);
      setUserRoles(roles);
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setSession(null);
    setUserRoles([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: userRoles.includes('admin'),
        userRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
