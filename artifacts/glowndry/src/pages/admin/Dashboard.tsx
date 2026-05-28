import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, ShoppingBag, TrendingUp, Package } from "lucide-react";
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

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Orders" value={String(stats.activeOrders)} icon={<Package />} change="Current in system" />
        <StatCard title="Daily Revenue" value={`₱${stats.dailyRevenue.toFixed(2)}`} icon={<CreditCard />} change="Today's earnings" />
        <StatCard title="Total Customers" value={String(stats.totalCustomers)} icon={<Users />} change="Registered users" />
        <StatCard title="Expected Drop-offs" value={String(stats.expectedDropoffs)} icon={<TrendingUp />} change="Scheduled today" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-none">
          <CardHeader>
            <CardTitle>Weekly Revenue (Estimate)</CardTitle>
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

        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {stats.recentBookings.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent orders</p>
            )}
            {stats.recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                    {(b.customerName || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.customerName || `Customer #${b.customerId}`}</p>
                    <p className="text-xs text-muted-foreground">Order #{b.id} • {b.weightKg ? `${b.weightKg}kg` : "N/A"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">₱{b.totalAmount?.toFixed(2) ?? "0.00"}</p>
                  <p className="text-xs text-primary font-medium">{statusLabels[b.status] || b.status}</p>
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

function StatCard({ title, value, icon, change }: { title: string, value: string, icon: React.ReactNode, change: string }) {
  return (
    <Card className="shadow-sm border-none">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            {icon}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}
