import { useState, useEffect } from "react";
import { Search, MoreHorizontal, CheckCircle, Clock, WashingMachine, Package, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";

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

type Service = { id: number; name: string; pricePerKg: number };
type Customer = { id: number; fullName: string };

const nextStatus: Record<string, string> = {
  scheduled: "received",
  received: "in_progress",
  in_progress: "ready",
  ready: "claimed",
};

export default function AdminBookings() {
  const [, navigate] = useLocation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updateOpen, setUpdateOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [updWeight, setUpdWeight] = useState("");
  const [updAmount, setUpdAmount] = useState("");
  const [newForm, setNewForm] = useState({ customerId: "", serviceId: "", scheduledDate: "", weightKg: "", notes: "" });

  const token = () => localStorage.getItem("adminToken");

  function load() {
    Promise.all([
      fetch("/api/bookings", { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()),
      fetch("/api/services", { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()),
      fetch("/api/customers", { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()),
    ]).then(([b, s, c]) => {
      setBookings(b);
      setServices(s);
      setCustomers(c);
      setLoading(false);
    });
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(booking: Booking) {
    const status = nextStatus[booking.status];
    if (!status) return;
    await fetch(`/api/bookings/${booking.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status }),
    });
    load();
  }

  function openUpdate(b: Booking) {
    setSelected(b);
    setUpdWeight(b.weightKg ? String(b.weightKg) : "");
    setUpdAmount(b.totalAmount ? String(b.totalAmount) : "");
    setUpdateOpen(true);
  }

  async function saveUpdate() {
    if (!selected) return;
    await fetch(`/api/bookings/${selected.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ weightKg: Number(updWeight) || 0, totalAmount: Number(updAmount) || 0 }),
    });
    setUpdateOpen(false);
    load();
  }

  async function createBooking() {
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({
        customerId: Number(newForm.customerId),
        serviceId: Number(newForm.serviceId),
        scheduledDate: newForm.scheduledDate,
        weightKg: Number(newForm.weightKg) || 0,
        notes: newForm.notes,
      }),
    });
    setNewOpen(false);
    setNewForm({ customerId: "", serviceId: "", scheduledDate: "", weightKg: "", notes: "" });
    load();
  }

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
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="claimed">Claimed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> New Booking</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>New Booking</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Customer</Label>
                <Select value={newForm.customerId} onValueChange={v => setNewForm({ ...newForm, customerId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.fullName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Service</Label>
                <Select value={newForm.serviceId} onValueChange={v => setNewForm({ ...newForm, serviceId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                  <SelectContent>
                    {services.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name} (₱{s.pricePerKg}/kg)</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Drop off Schedule</Label>
                <Input type="date" value={newForm.scheduledDate} onChange={e => setNewForm({ ...newForm, scheduledDate: e.target.value })} />
              </div>
              <div>
                <Label>Weight (kg)</Label>
                <Input type="number" value={newForm.weightKg} onChange={e => setNewForm({ ...newForm, weightKg: e.target.value })} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={newForm.notes} onChange={e => setNewForm({ ...newForm, notes: e.target.value })} />
              </div>
              <Button className="w-full" onClick={createBooking}>Create Booking</Button>
            </div>
          </DialogContent>
        </Dialog>
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
                <TableCell><StatusBadge status={booking.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {nextStatus[booking.status] && (
                      <Button variant="outline" size="sm" onClick={() => updateStatus(booking)}>
                        → {statusLabels[nextStatus[booking.status]]}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openUpdate(booking)}>Edit</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Edit Booking #{selected?.id}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Weight (kg)</Label>
              <Input type="number" value={updWeight} onChange={e => setUpdWeight(e.target.value)} />
            </div>
            <div>
              <Label>Total Amount (₱)</Label>
              <Input type="number" value={updAmount} onChange={e => setUpdAmount(e.target.value)} />
            </div>
            <Button className="w-full" onClick={saveUpdate}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const statusLabels: Record<string, string> = {
  scheduled: "Scheduled", received: "Received", in_progress: "In Progress", ready: "Ready", claimed: "Claimed",
};

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
