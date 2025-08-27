import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  isHidden: boolean;
}

export function Sidebar({ className, isHidden }: SidebarProps) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "fas fa-home" },
    { name: "Study Planner", href: "/study-planner", icon: "fas fa-calendar-alt" },
    { name: "Quiz Generator", href: "/quiz-generator", icon: "fas fa-brain" },
    { name: "Collaboration", href: "/collaboration", icon: "fas fa-users" },
    { name: "Idea Marketplace", href: "/idea-marketplace", icon: "fas fa-lightbulb" },
    { name: "Learning Buddy", href: "/learning-buddy", icon: "fas fa-robot" },
  ];

  return (
    <aside 
      className={cn(
        "w-64 bg-card border-r border-border flex-shrink-0 transition-transform duration-300 ease-in-out",
        isHidden && "md:translate-x-0 -translate-x-full",
        className
      )}
      data-testid="sidebar"
    >
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-graduation-cap text-primary-foreground text-sm"></i>
          </div>
          <h1 className="text-xl font-bold text-foreground" data-testid="app-title">CampusAI</h1>
        </div>
        
        {/* Navigation */}
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <i className={`${item.icon} w-4`}></i>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
