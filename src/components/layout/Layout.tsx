import { useState } from "react";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import MobileTabBar from "./MobileTabBar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
