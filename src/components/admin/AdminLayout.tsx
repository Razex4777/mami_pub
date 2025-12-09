import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import AdminMobileTabBar from './AdminMobileTabBar';
import { cn } from '@/lib/utils';

const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Sidebar - Desktop only */}
      <div className="hidden md:block">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={false}
        />
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        "md:ml-64",
        sidebarCollapsed && "md:ml-16"
      )}>
        {/* Topbar */}
        <AdminTopbar 
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobile={isMobile}
        />

        {/* Page Content - Add bottom padding for mobile tab bar */}
        <main className="p-3 sm:p-4 md:p-6 pb-20 md:pb-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Tab Bar */}
      <AdminMobileTabBar />
    </div>
  );
};

export default AdminLayout;