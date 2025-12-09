import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    // Check for stored authentication
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Easter egg authentication - only "admin" / "admin" works
    if (username === 'admin' && password === 'admin') {
      const adminUser: User = {
        id: '1',
        name: 'Admin User',
        email: 'admin@mamipub.com',
        role: 'admin',
        avatar: '/images/admin-avatar.png',
        lastLogin: new Date().toISOString(),
        isActive: true,
      };
      
      setUser(adminUser);
      localStorage.setItem('admin_user', JSON.stringify(adminUser));
      
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
      localStorage.setItem('admin_activities', JSON.stringify(activities.slice(0, 100))); // Keep last 100 activities
      
      return true;
    }
    return false;
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