
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileSidebar from "./MobileSidebar";
import MobileBottomNav from "./MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useDevMode } from "@/contexts/DevModeContext";

const UnifiedLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { isDevMode } = useDevMode();
  const location = useLocation();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <div className={`flex min-h-screen bg-background overflow-hidden ${isDevMode ? 'pt-12' : ''}`}>
      {/* Desktop sidebar - hidden on mobile */}
      {!isMobile && <Sidebar />}
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header onMobileMenuToggle={toggleMobileMenu} />
        
        <ScrollArea className="flex-1" orientation="vertical">
          <div className={`p-2 md:p-6 ${isMobile ? 'pb-20' : ''}`}>
            <div className="max-w-full mx-auto">
              <Outlet />
            </div>
          </div>
        </ScrollArea>
        
        {/* Mobile navigation - only visible on mobile */}
        {isMobile && (
          <>
            <MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
            <MobileBottomNav onOpenMenu={toggleMobileMenu} />
          </>
        )}
      </div>
    </div>
  );
};

export default UnifiedLayout;
