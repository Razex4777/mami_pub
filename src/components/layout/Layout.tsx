import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import MobileTabBar from "./MobileTabBar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Cleanup stuck overlays on route change (fixes mobile black screen bug)
  useEffect(() => {
    // Reset body styles that might be stuck from modals/sheets/dialogs
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.paddingRight = '';
    document.documentElement.style.overflow = '';
    
    // Remove Radix UI scroll lock data attributes
    document.body.removeAttribute('data-scroll-locked');
    document.documentElement.removeAttribute('data-scroll-locked');
    
    // Remove any stuck Radix portals/overlays (Sheet, Dialog, etc.)
    const stuckOverlays = document.querySelectorAll('[data-radix-portal]');
    stuckOverlays.forEach(overlay => {
      // Only remove if it's an overlay that shouldn't persist
      if (overlay.querySelector('[data-state="closed"]') || 
          overlay.querySelector('.fixed.inset-0')) {
        overlay.remove();
      }
    });

    // Scroll to top on navigation
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Topbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex pt-16 sm:pt-20">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar isOpen={sidebarOpen} />
        </div>
        
        {/* Main content - no margin on mobile, sidebar margin on desktop */}
        <main className={`flex-1 transition-all duration-300 pb-20 md:pb-0 ${sidebarOpen ? 'md:ml-48' : 'md:ml-[52px]'}`}>
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Tab Bar - only visible on mobile */}
      <MobileTabBar />
    </div>
  );
};

export default Layout;
