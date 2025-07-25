import React, { useEffect } from "react";
import { Bell, MessageSquare, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { ROLE_DETAILS } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import AvatarDisplay from "@/components/auth/avatar/AvatarDisplay";
import { useDevMode } from "@/contexts/DevModeContext";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onMobileMenuToggle
}) => {
  const {
    user,
    logout,
    refreshProfile
  } = useUser();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isDevMode } = useDevMode();

  useEffect(() => {
    if (!user) return;
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        refreshProfile().then(updated => {
          if (updated) {
            console.log("Profile automatically refreshed");
          }
        });
      }
    }, 5 * 60 * 1000); // 5 minutes

    refreshProfile();
    return () => clearInterval(intervalId);
  }, [user, refreshProfile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-sidebar-border px-4 py-2 md:px-6 md:py-3 bg-sidebar text-sidebar-foreground">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {isMobile}
          
          <Link to="/" className="flex items-center">
            <img src="/lovable-uploads/9a31da8a-a1fd-4326-9d13-1d452aa8c0b5.png" alt="Arivia Villas" className="h-12 md:h-10 invert brightness-0 filter" />
          </Link>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative hidden md:flex border-sidebar-border bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <NotificationItem title="New Maintenance Request" message="Villa Caldera has reported a plumbing issue in the master bathroom." time="10 minutes ago" />
                <NotificationItem title="Housekeeping Task Completed" message="Villa Azure cleanup has been completed and verified." time="1 hour ago" />
                <NotificationItem title="Low Inventory Alert" message="Bathroom supplies are running low at Villa Sunset." time="2 hours ago" />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary">
                <span>View All Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="hidden md:flex border-sidebar-border bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Messages</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <MessageItem name="Maria Kowalska" message="When will the new supplies arrive?" time="5 min ago" avatar="/placeholder.svg" />
                <MessageItem name="Alex Chen" message="I've completed the Villa Oceana inspection." time="30 min ago" avatar="/placeholder.svg" />
                <MessageItem name="Stefan Müller" message="Guest requesting early check-in at Villa Sunset." time="1 hour ago" avatar="/placeholder.svg" />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary">
                <span>Open Team Chat</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                {user && <AvatarDisplay user={user} size="sm" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => refreshProfile()}>
                <span className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>Refresh Profile</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <span className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

interface NotificationItemProps {
  title: string;
  message: string;
  time: string;
}

const NotificationItem = ({
  title,
  message,
  time
}: NotificationItemProps) => {
  return (
    <div className="px-2 py-3 hover:bg-secondary cursor-pointer">
      <div className="font-medium text-sm">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">{message}</div>
      <div className="text-xs text-muted-foreground mt-1">{time}</div>
    </div>
  );
};

interface MessageItemProps {
  name: string;
  message: string;
  time: string;
  avatar: string;
}

const MessageItem = ({
  name,
  message,
  time,
  avatar
}: MessageItemProps) => {
  return (
    <div className="flex items-start space-x-3 px-2 py-3 hover:bg-secondary cursor-pointer">
      <div className="h-8 w-8 rounded-full overflow-hidden">
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <div className="font-medium text-sm truncate">{name}</div>
          <div className="text-xs text-muted-foreground">{time}</div>
        </div>
        <div className="text-sm text-muted-foreground mt-1 truncate">{message}</div>
      </div>
    </div>
  );
};

export default Header;
