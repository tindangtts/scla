import { Link, useLocation } from "wouter";
import { Home, Compass, Calendar, HelpCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/bookings", label: "Bookings", icon: Calendar },
    { href: "/star-assist", label: "Support", icon: HelpCircle },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-1 h-16">
        {links.map((link) => {
          const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex-1 h-full flex flex-col items-center justify-center gap-0.5 group"
              data-testid={`nav-${link.label.toLowerCase()}`}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all",
                isActive ? "bg-primary/10" : "group-hover:bg-muted"
              )}>
                <Icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
