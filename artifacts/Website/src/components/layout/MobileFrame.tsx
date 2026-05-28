import React from "react";
import { Link, useLocation } from "wouter";
import { Home, PlusCircle, MapPin, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileFrameProps {
  children: React.ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  const [location] = useLocation();

  // Don't show bottom nav on login/register
  const showNav = !location.includes("/login") && !location.includes("/register") && location !== "/app";

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/30 p-4">
      <div className="mb-4 text-center">
        <span className="text-sm font-medium text-primary/80 uppercase tracking-widest">Customer App Preview</span>
      </div>
      
      {/* Phone container */}
      <div className="relative w-full max-w-[390px] h-[844px] bg-background rounded-[48px] shadow-2xl overflow-hidden border-[8px] border-slate-900 flex flex-col">
        {/* Dynamic Island / Notch area */}
        <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50 pointer-events-none">
          <div className="w-32 h-6 bg-slate-900 rounded-b-3xl"></div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar">
          {children}
        </div>

        {/* Bottom Navigation */}
        {showNav && (
          <div className="h-20 bg-background/80 backdrop-blur-lg border-t border-border flex items-center justify-around px-2 pb-5 pt-2 relative z-40">
            <NavItem href="/app/dashboard" icon={<Home className="w-6 h-6" />} label="Home" active={location === "/app/dashboard"} />
            <NavItem href="/app/booking" icon={<PlusCircle className="w-6 h-6" />} label="Book" active={location === "/app/booking"} />
            <NavItem href="/app/tracker" icon={<MapPin className="w-6 h-6" />} label="Track" active={location === "/app/tracker"} />
            <NavItem href="/app/notifications" icon={<Bell className="w-6 h-6" />} label="Alerts" active={location === "/app/notifications"} />
            <NavItem href="/app/profile" icon={<User className="w-6 h-6" />} label="Profile" active={location === "/app/profile"} />
          </div>
        )}

        {/* Home Indicator */}
        <div className="absolute bottom-1.5 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href} className={cn("flex flex-col items-center justify-center gap-1 w-16 text-muted-foreground transition-colors", active && "text-primary")}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
