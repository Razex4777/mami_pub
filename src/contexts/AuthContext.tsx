import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/supabase';
import { supabase } from '@/supabase';

// Server-side authentication response types
interface AuthResponse {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    username: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  };
  session?: {
    token: string;
    expiresAt: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Supabase Edge Function URL for admin login
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const AUTH_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/admin-login`;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication and session validity
    const storedUser = localStorage.getItem('admin_user');
    const storedSession = localStorage.getItem('admin_session');
    
    if (storedUser && storedSession) {
      try {
        const session = JSON.parse(storedSession);
        const expiresAt = new Date(session.expiresAt);
        
        // Check if session is still valid
        if (expiresAt > new Date()) {
          setUser(JSON.parse(storedUser));
        } else {
          // Session expired, clear storage
          localStorage.removeItem('admin_user');
          localStorage.removeItem('admin_session');
        }
      } catch {
        // Invalid session data, clear storage
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Input validation
      if (!username || !password) {
        console.error('Login error: Username and password are required');
        return false;
      }

      // Call server-side Edge Function for secure authentication
      // Password verification happens on the server - no hash exposure to client
      const response = await fetch(AUTH_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ username, password }),
      });

      const data: AuthResponse = await response.json();

      if (!data.success || !data.user || !data.session) {
        console.error('Login error:', data.error || 'Authentication failed');
        return false;
      }

      // Create user object from server response (no password_hash exposed)
      const adminUser: User = {
        id: data.user.id,
        name: data.user.name || username,
        email: data.user.email || '',
        role: 'admin',
        avatar: data.user.avatar || '/images/admin-avatar.png',
        lastLogin: new Date().toISOString(),
        isActive: true,
      };

      // Store user and session securely
      setUser(adminUser);
      localStorage.setItem('admin_user', JSON.stringify(adminUser));
      localStorage.setItem('admin_session', JSON.stringify(data.session));

      // Log activity
      const activity = {
        id: Date.now().toString(),
        type: 'system' as const,
        title: 'User Login',
        description: `${adminUser.name} logged in to the admin dashboard`,
        timestamp: new Date().toISOString(),
        userId: adminUser.id,
        userName: adminUser.name,
      };

      const storedActivities = localStorage.getItem('admin_activities');
      const activities = storedActivities ? JSON.parse(storedActivities) : [];
      activities.unshift(activity);
      localStorage.setItem('admin_activities', JSON.stringify(activities.slice(0, 100)));

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    if (user) {
      // Log activity
      const activity = {
        id: Date.now().toString(),
        type: 'system' as const,
        title: 'User Logout',
        description: `${user.name} logged out of the admin dashboard`,
        timestamp: new Date().toISOString(),
        userId: user.id,
        userName: user.name,
      };
      
      const storedActivities = localStorage.getItem('admin_activities');
      const activities = storedActivities ? JSON.parse(storedActivities) : [];
      activities.unshift(activity);
      localStorage.setItem('admin_activities', JSON.stringify(activities.slice(0, 100)));
    }
    
    setUser(null);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_session');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};