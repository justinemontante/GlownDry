import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, ShoppingBag, TrendingUp, Package, Calendar, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useLocation } from "wouter";

type DashboardStats = {
  activeOrders: number;
  dailyRevenue: number;
  expectedDropoffs: number;
  totalCustomers: number;
  totalBookings: number;
  recentBookings: {
    id: number;
    customerId: number;
    customerName: string | null;
    weightKg: number | null;
    totalAmount: number | null;
    status: string;
    createdAt: string;
  }[];
};

const statusLabels: Record<string, string> = {
  scheduled: "Scheduled",
  received: "Received",
  in_progress: "In Progress",
  ready: "Ready",
  claimed: "Claimed",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getCurrentDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) { navigate("/admin/login"); return; }

    fetch("/api/dashboard/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-8 p-8">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-sm border-none">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-none p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </Card>
        <Card className="shadow-sm border-none p-6">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
  if (!stats) return <div className="p-8 text-center text-muted-foreground">Failed to load dashboard.</div>;

  const chartData = [
    { name: 'Mon', revenue: Math.round(stats.dailyRevenue * 0.8) },
    { name: 'Tue', revenue: Math.round(stats.dailyRevenue * 0.9) },
    { name: 'Wed', revenue: Math.round(stats.dailyRevenue * 1.0) },
    { name: 'Thu', revenue: Math.round(stats.dailyRevenue * 1.1) },
    { name: 'Fri', revenue: Math.round(stats.dailyRevenue * 1.2) },
    { name: 'Sat', revenue: Math.round(stats.dailyRevenue * 0.7) },
    { name: 'Sun', revenue: Math.round(stats.dailyRevenue * 0.5) },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{getCurrentDate()}</p>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{getGreeting()}, Admin</h1>
            <p className="text-sm text-slate-500">Here's what's happening with your business today.</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Package className="w-7 h-7 text-primary" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Orders" value={String(stats.activeOrders)} icon={<Package />} change="Current in system" accent="bg-orange-500/10 text-orange-600" />
        <StatCard title="Daily Revenue" value={`₱${stats.dailyRevenue.toFixed(2)}`} icon={<CreditCard />} change="Today's earnings" accent="bg-green-500/10 text-green-600" />
        <StatCard title="Total Customers" value={String(stats.totalCustomers)} icon={<Users />} change="Registered users" accent="bg-blue-500/10 text-blue-600" />
        <StatCard title="Expected Drop-offs" value={String(stats.expectedDropoffs)} icon={<TrendingUp />} change="Scheduled today" accent="bg-purple-500/10 text-purple-600" />
      </div>

      {/* Charts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Revenue (Estimate)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {stats.recentBookings.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent orders</p>
            )}
            {stats.recentBookings.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {(b.customerName || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.customerName || `Customer #${b.customerId}`}</p>
                    <p className="text-xs text-muted-foreground">Order #{b.id} • {b.weightKg ? `${b.weightKg}kg` : "N/A"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">₱{b.totalAmount?.toFixed(2) ?? "0.00"}</p>
                  <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {statusLabels[b.status] || b.status}
                  </span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => navigate("/admin/bookings")}>View All Orders</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, change, accent }: { title: string, value: string, icon: React.ReactNode, change: string, accent: string }) {
  return (
    <Card className="shadow-sm border-0 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
          </div>
          <div className={`p-3 rounded-xl ${accent}`}>
            {icon}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}
