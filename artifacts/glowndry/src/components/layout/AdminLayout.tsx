import React from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  ListOrdered, 
  Box, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  WashingMachine
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar flex-shrink-0 flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border gap-3">
          <WashingMachine className="w-8 h-8 text-sidebar-primary-foreground" />
          <span className="text-xl font-bold text-sidebar-foreground tracking-tight">GLOWNDRY</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
          <NavItem href="/admin/dashboard" icon={<LayoutDashboard />} label="Dashboard" active={location === "/admin/dashboard"} />
          <NavItem href="/admin/bookings" icon={<CalendarCheck />} label="Bookings" active={location === "/admin/bookings"} />
          <NavItem href="/admin/services" icon={<ListOrdered />} label="Services" active={location === "/admin/services"} />
          <NavItem href="/admin/inventory" icon={<Box />} label="Inventory" active={location === "/admin/inventory"} />
          <NavItem href="/admin/customers" icon={<Users />} label="Customers" active={location === "/admin/customers"} />
          <NavItem href="/admin/payments" icon={<CreditCard />} label="Payments" active={location === "/admin/payments"} />
          <NavItem href="/admin/reports" icon={<BarChart3 />} label="Reports" active={location === "/admin/reports"} />
        </div>

        <div className="p-4 border-t border-sidebar-border flex flex-col gap-1">
          <NavItem href="/admin/settings" icon={<Settings />} label="Settings" active={location === "/admin/settings"} />
          <NavItem href="/admin/login" icon={<LogOut />} label="Logout" active={false} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-card border-b flex items-center justify-between px-8 shadow-sm shrink-0 z-10">
          <h1 className="text-xl font-semibold">
            {location.split("/").pop()?.charAt(0).toUpperCase() + location.split("/").pop()?.slice(1)!}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              AD
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200",
        active 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      {label}
    </Link>
  );
}
