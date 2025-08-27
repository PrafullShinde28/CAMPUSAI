import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { signOutUser } from "@/lib/auth";

interface TopNavbarProps {
  onSidebarToggle: () => void;
  title: string;
}

export function TopNavbar({ onSidebarToggle, title }: TopNavbarProps) {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4" data-testid="top-navbar">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onSidebarToggle}
            data-testid="sidebar-toggle"
          >
            <i className="fas fa-bars"></i>
          </Button>
          <h2 className="text-lg font-semibold text-foreground" data-testid="page-title">{title}</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Input
              type="text"
              placeholder="Search..."
              className="w-64"
              data-testid="search-input"
            />
            <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm"></i>
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative" data-testid="notifications-button">
            <i className="fas fa-bell"></i>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>
          
          {/* Profile */}
          <div className="flex items-center space-x-2">
            {user?.profileImage && (
              <img 
                src={user.profileImage} 
                alt="User profile" 
                className="w-8 h-8 rounded-full"
                data-testid="user-avatar"
              />
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
              data-testid="sign-out-button"
            >
              <i className="fas fa-sign-out-alt"></i>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
