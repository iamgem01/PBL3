import { Home, Sparkles, Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";

interface SidebarMainButtonsProps {
  collapsed: boolean;
}

export default function SidebarMainButtons({
  collapsed,
}: SidebarMainButtonsProps) {
  const buttons = [
    { label: "Home", icon: <Home size={16} />, path: "/home" },
    { label: "Aeternus AI", icon: <Sparkles size={16} />, path: "/ai" },
    { label: "Notification", icon: <Bell size={16} />, path: "/notifications" },
    { label: "Search", icon: <Search size={16} />, path: "/search" },
  ];

  return (
    <div className="border-t border-border p-3 text-sm">
      <div className="space-y-1">
        {buttons.map((btn) => (
          <Link
            key={btn.label}
            to={btn.path}
            className="flex items-center gap-2 w-full px-2 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
          >
            {btn.icon}
            <span className={`${collapsed ? "hidden" : "inline font-medium"}`}>
              {btn.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}