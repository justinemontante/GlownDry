import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ShoppingBag, Users, CreditCard, Package, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useLocation } from "wouter";

type DashboardStats = {
  totalBookings: number;
  totalCustomers: number;
  activeOrders: number;
  dailyRevenue: number;
  expectedDropoffs: number;
  recentBookings: {
    id: number;
    totalAmount: number | null;
    status: string;
    createdAt: string;
  }[];
};

export default function AdminReports() {
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

  const loadingEl = (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1,2].map(i => <div key={i} className="h-80 bg-slate-100 rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  if (loading) return <div className="p-8">{loadingEl}</div>;

  const completedBookings = stats?.recentBookings?.filter(b => b.status === "completed") ?? [];
  const claimedBookings = stats?.recentBookings?.filter(b => b.status === "claimed") ?? [];
  const inProgressBookings = stats?.recentBookings?.filter(b => ["scheduled", "received", "in_progress", "ready"].includes(b.status)) ?? [];

  const totalRevenue = stats?.recentBookings.reduce((sum, b) => sum + (b.totalAmount ?? 0), 0) ?? 0;
  const avgOrderValue = stats?.totalBookings ? totalRevenue / stats.totalBookings : 0;

  const monthlyData = stats?.recentBookings.length
    ? [
        { name: 'This Week', value: Math.round(totalRevenue * 0.4) },
        { name: 'Pending', value: Math.round(avgOrderValue * inProgressBookings.length) },
        { name: 'Completed', value: Math.round(avgOrderValue * completedBookings.length) },
        { name: 'Claimed', value: Math.round(avgOrderValue * claimedBookings.length) },
      ]
    : [
        { name: 'This Week', value: 0 },
        { name: 'Pending', value: 0 },
        { name: 'Completed', value: 0 },
        { name: 'Claimed', value: 0 },
      ];

  const statusData = [
    { name: 'Scheduled', value: stats?.recentBookings.filter(b => b.status === "scheduled").length ?? 0 },
    { name: 'Received', value: stats?.recentBookings.filter(b => b.status === "received").length ?? 0 },
    { name: 'In Progress', value: stats?.recentBookings.filter(b => b.status === "in_progress").length ?? 0 },
    { name: 'Ready', value: stats?.recentBookings.filter(b => b.status === "ready").length ?? 0 },
    { name: 'Claimed', value: claimedBookings.length },
  ];

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">Business performance overview</p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="w-4 h-4 mr-2" /> Export Report
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm font-medium">Total Bookings</p>
                <h3 className="text-3xl font-bold mt-1">{stats?.totalBookings ?? 0}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">₱{totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Orders</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">{stats?.activeOrders ?? 0}</h3>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Customers</p>
                <h3 className="text-3xl font-bold text-foreground mt-1">{stats?.totalCustomers ?? 0}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Revenue by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={v => `₱${v}`} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(v: number) => [`₱${v.toFixed(2)}`, '']} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Bookings by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#0f172a', fontWeight: 500, fontSize: 12}} width={80} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print-only section */}
      <div className="hidden print:block space-y-4">
        <h1 className="text-2xl font-bold">GlownDry Business Report</h1>
        <p className="text-sm text-muted-foreground">Generated on {new Date().toLocaleDateString("en-PH", { dateStyle: "long" })}</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded">Total Bookings: {stats?.totalBookings ?? 0}</div>
          <div className="p-4 border rounded">Total Revenue: ₱{totalRevenue.toFixed(2)}</div>
          <div className="p-4 border rounded">Active Orders: {stats?.activeOrders ?? 0}</div>
          <div className="p-4 border rounded">Total Customers: {stats?.totalCustomers ?? 0}</div>
        </div>
      </div>
    </div>
  );
}