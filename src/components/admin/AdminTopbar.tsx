import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/interactive/button';
import { Input } from '@/components/ui/forms/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/overlays/sheet';
import { Badge } from '@/components/ui/data-display/badge';
import {
  Bell,
  Search,
  Menu,
} from 'lucide-react';
import { useToast } from '@/components/ui/feedback/use-toast';

interface AdminTopbarProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({ onMenuClick, isMobile }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(0);

  // Mock notifications count
  useEffect(() => {
    const storedNotifications = localStorage.getItem('admin_notifications');
    if (storedNotifications) {
      const notifs = JSON.parse(storedNotifications);
      setNotifications(notifs.filter((n: any) => !n.read).length);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Search initiated",
        description: `Searching for "${searchQuery}"...`,
      });
    }
  };

  const clearNotifications = () => {
    setNotifications(0);
    localStorage.setItem('admin_notifications', JSON.stringify([]));
    toast({
      title: "Notifications cleared",
      description: "All notifications have been marked as read.",
    });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 md:h-16 items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Menu button - Desktop only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="h-8 w-8 p-0 hidden md:flex"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Admin title on mobile */}
          <span className="text-sm font-semibold md:hidden">Admin</span>

          {/* Search - Hidden on mobile, shown on tablet+ */}
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 sm:w-56 md:w-64 lg:w-80 pl-10 pr-4 h-8 sm:h-9 text-sm bg-muted/50 border-0 focus:bg-background"
            />
          </form>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>
                  Stay updated with the latest activities
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {notifications > 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {notifications} unread notification{notifications !== 1 ? 's' : ''}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearNotifications}
                        className="h-6 px-2"
                      >
                        Mark all read
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {/* Mock notifications */}
                      <div className="rounded-lg border p-3">
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">New order received</p>
                            <p className="text-xs text-muted-foreground">Order #12345 from John Doe</p>
                            <p className="text-xs text-muted-foreground">2 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 rounded-full bg-amber-500 mt-2" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Low stock alert</p>
                            <p className="text-xs text-muted-foreground">Product "DTF Transfer Film" is running low</p>
                            <p className="text-xs text-muted-foreground">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No notifications</p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Activity indicator */}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground hidden sm:inline">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;