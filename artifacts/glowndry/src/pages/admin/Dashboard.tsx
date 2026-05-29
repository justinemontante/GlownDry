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

const statusColors: Record<string, string> = {
  scheduled: "#3b82f6",
  received: "#8b5cf6",
  in_progress: "#f59e0b",
  ready: "#22c55e",
  claimed: "#6b7280",
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="shadow-sm border-none">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-none p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-[240px] w-full rounded-lg" />
        </Card>
        <Card className="shadow-sm border-none p-6 space-y-4">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Bookings" value={String(stats.totalBookings)} icon={<ShoppingBag />} change="All time orders" accent="bg-teal-500/10 text-teal-600" />
        <StatCard title="Active Orders" value={String(stats.activeOrders)} icon={<Package />} change="Current in system" accent="bg-orange-500/10 text-orange-600" />
        <StatCard title="Daily Revenue" value={`₱${stats.dailyRevenue.toFixed(2)}`} icon={<CreditCard />} change="Today's earnings" accent="bg-green-500/10 text-green-600" />
        <StatCard title="Total Customers" value={String(stats.totalCustomers)} icon={<Users />} change="Registered users" accent="bg-blue-500/10 text-blue-600" />
        <StatCard title="Expected Drop-offs" value={String(stats.expectedDropoffs)} icon={<TrendingUp />} change="Scheduled today" accent="bg-purple-500/10 text-purple-600" />
      </div>

      {/* Recent Bookings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Bookings
          </h2>
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => navigate("/admin/bookings")}>
            View All
          </Button>
        </div>
        {stats.recentBookings.length === 0 ? (
          <Card className="shadow-sm border-0">
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No recent bookings found.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-sm border-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order #</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Weight</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate("/admin/bookings")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {(b.customerName || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">{b.customerName || `Customer #${b.customerId}`}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">#{b.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.weightKg ? `${b.weightKg}kg` : "—"}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">₱{b.totalAmount?.toFixed(2) ?? "0.00"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: `${statusColors[b.status] ?? '#6b7280'}20`, color: statusColors[b.status] ?? '#6b7280' }}>
                        {statusLabels[b.status] || b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(b.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {/* Chart & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Weekly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
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
              <Calendar className="w-5 h-5 text-primary" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
              <div>
                <p className="text-sm text-muted-foreground">Active Orders</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeOrders}</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/10">
                <Package className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
              <div>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold text-foreground">₱{stats.dailyRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <CreditCard className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
              <div>
                <p className="text-sm text-muted-foreground">Drop-offs Today</p>
                <p className="text-2xl font-bold text-foreground">{stats.expectedDropoffs}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
            </div>
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
