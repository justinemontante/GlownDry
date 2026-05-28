import { useState, useEffect } from "react";
import { Search, Filter, MoreHorizontal, CheckCircle, Clock, WashingMachine, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Booking = {
  id: number;
  customerId: number;
  customerName: string | null;
  serviceName: string | null;
  weightKg: number | null;
  totalAmount: number | null;
  status: string;
  scheduledDate: string;
};

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "received", label: "Received" },
  { value: "in_progress", label: "In Progress" },
  { value: "ready", label: "Ready" },
  { value: "claimed", label: "Claimed" },
];

const statusLabels: Record<string, string> = {
  scheduled: "Scheduled",
  received: "Received",
  in_progress: "In Progress",
  ready: "Ready",
  claimed: "Claimed",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    fetch("/api/bookings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setBookings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b => {
    const matchSearch = !search || (b.customerName || "").toLowerCase().includes(search.toLowerCase()) || String(b.id).includes(search);
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading bookings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button>New Booking</Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b">
            <TableRow>
              <TableHead className="w-[100px] font-semibold text-slate-600">Order #</TableHead>
              <TableHead className="font-semibold text-slate-600">Customer</TableHead>
              <TableHead className="font-semibold text-slate-600">Service</TableHead>
              <TableHead className="font-semibold text-slate-600">Weight/Qty</TableHead>
              <TableHead className="font-semibold text-slate-600">Total</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No bookings found</TableCell>
              </TableRow>
            )}
            {filtered.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium">ORD-{String(booking.id).padStart(4, "0")}</TableCell>
                <TableCell>{booking.customerName || `Customer #${booking.customerId}`}</TableCell>
                <TableCell>{booking.serviceName || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{booking.weightKg ? `${booking.weightKg}kg` : "—"}</TableCell>
                <TableCell className="font-medium">₱{booking.totalAmount?.toFixed(2) ?? "0.00"}</TableCell>
                <TableCell>
                  <StatusBadge status={booking.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm">Update</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    scheduled: { label: "Scheduled", icon: <Clock className="w-3 h-3 mr-1"/>, className: "bg-blue-50 text-blue-700 border-blue-200" },
    received: { label: "Received", icon: <Package className="w-3 h-3 mr-1"/>, className: "bg-purple-50 text-purple-700 border-purple-200" },
    in_progress: { label: "In Progress", icon: <WashingMachine className="w-3 h-3 mr-1"/>, className: "bg-amber-50 text-amber-700 border-amber-200" },
    ready: { label: "Ready", icon: <CheckCircle className="w-3 h-3 mr-1"/>, className: "bg-green-50 text-green-700 border-green-200" },
    claimed: { label: "Claimed", icon: <Package className="w-3 h-3 mr-1"/>, className: "bg-slate-100 text-slate-600 border-slate-200" },
  };
  const c = config[status] || { label: status, icon: null, className: "" };
  return <Badge variant="outline" className={c.className}>{c.icon} {c.label}</Badge>;
}
