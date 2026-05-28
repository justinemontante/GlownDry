import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WashingMachine, Users, CreditCard, LayoutDashboard } from "lucide-react";
import { Link } from "wouter";

export default function AdminLogin() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left side brand panel */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-sidebar to-sidebar-accent text-sidebar-foreground p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="z-10 text-center max-w-md">
          <WashingMachine className="w-24 h-24 mx-auto mb-8 text-primary-foreground" />
          <h1 className="text-5xl font-bold tracking-tight mb-4">GLOWNDRY Admin</h1>
          <p className="text-xl text-primary-foreground/80">
            Professional laundry management platform. Control orders, inventory, and insights from one place.
          </p>
        </div>
      </div>

      {/* Right side login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden text-center">
            <WashingMachine className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground">GLOWNDRY</h1>
          </div>
          
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <p className="text-muted-foreground mt-2">Sign in to your admin account to continue.</p>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input type="email" placeholder="admin@glowndry.com" className="h-12" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Password</label>
                </div>
                <Input type="password" placeholder="••••••••" className="h-12" />
              </div>
              <Link href="/admin/dashboard" className="block w-full pt-4">
                <Button className="w-full h-12 text-lg">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
