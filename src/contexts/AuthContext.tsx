import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/api';

interface User {
  id: string;
  username: string;
  email?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userRoles: string[];
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const currentUser = authAPI.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setUserRoles(currentUser.roles || []);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authAPI.login(email, password);
    
    const userData: User = {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      roles: data.user.roles || [],
    };
    
    setUser(userData);
    setUserRoles(userData.roles);
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setUserRoles([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: userRoles.includes('admin'),
        userRoles,
        loading,
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
