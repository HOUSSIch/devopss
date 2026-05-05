import { Link, useLocation } from "react-router-dom";
import { Home, LayoutDashboard, Scan, Sparkles, User, Clock3, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const authenticatedNavItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Scan", icon: Scan },
  { to: "/results", label: "Results", icon: Sparkles },
  { to: "/activity", label: "History", icon: Clock3 },
  { to: "/profile", label: "Profile", icon: User },
];

const guestNavItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/create-account", label: "Join", icon: UserPlus },
  { to: "/signin", label: "Sign In", icon: LogIn },
];

export function BottomNavigation() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const navItems = isAuthenticated ? authenticatedNavItems : guestNavItems;

  return (
    <nav className="deepskyn-bottom-nav deepskyn-bottom-nav-immersive lg:hidden px-2 py-1" aria-label="Bottom mobile navigation">
      <div className={`grid ${isAuthenticated ? "grid-cols-6" : "grid-cols-3"} gap-1`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`deepskyn-bottom-nav-item ${isActive ? "active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
