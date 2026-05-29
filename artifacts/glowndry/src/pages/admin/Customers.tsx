import { useState, useEffect } from "react";
import { Search, Mail, Phone, ExternalLink, Calendar, Weight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Customer = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  totalOrders: number;
  createdAt: string;
  profileImage?: string | null;
};

type Booking = {
  id: number;
  serviceName: string | null;
  weightKg: number | null;
  totalAmount: number | null;
  status: string;
  scheduledDate: string;
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  scheduled: "Scheduled", received: "Received", in_progress: "In Progress", ready: "Ready", claimed: "Claimed",
};

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700", received: "bg-purple-50 text-purple-700",
  in_progress: "bg-amber-50 text-amber-700", ready: "bg-green-50 text-green-700", claimed: "bg-slate-100 text-slate-600",
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [history, setHistory] = useState<Booking[]>([]);

  const token = () => localStorage.getItem("adminToken");

  useEffect(() => {
    fetch("/api/customers", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setCustomers(data); setLoading(false); });
  }, []);

  async function viewHistory(c: Customer) {
    setSelectedCustomer(c);
    setHistoryOpen(true);
    const data = await fetch(`/api/bookings?customerId=${c.id}`, {
      headers: { Authorization: `Bearer ${token()}` },
    }).then(r => r.json());
    setHistory(data);
  }

  const filtered = search
    ? customers.filter(c =>
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
      )
    : customers;

  if (loading) return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-96 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex gap-4 pb-4 border-b">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search customers..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button variant="outline">Export CSV</Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Customer</TableHead>
              <TableHead className="font-semibold text-slate-600">Contact Info</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Total Orders</TableHead>
              <TableHead className="font-semibold text-slate-600">Member Since</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No customers found</TableCell>
              </TableRow>
            )}
            {filtered.map((c) => (
              <TableRow key={c.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={c.profileImage || undefined} alt={c.fullName} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                        {c.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{c.fullName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {c.email}</div>
                    <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {c.phone}</div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-semibold text-primary">{c.totalOrders}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary" onClick={() => viewHistory(c)}>
                    View History <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCustomer?.fullName} — Booking History</DialogTitle>
          </DialogHeader>
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No bookings yet</p>
          ) : (
            <div className="space-y-3 pt-2">
              {history.map(b => (
                <Card key={b.id} className="p-4 border-none shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">ORD-{String(b.id).padStart(4, "0")}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(b.scheduledDate).toLocaleDateString()}</span>
                        {b.serviceName && <span>{b.serviceName}</span>}
                        {b.weightKg && <span className="flex items-center gap-1"><Weight className="w-3 h-3" /> {b.weightKg}kg</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₱{b.totalAmount?.toFixed(2) ?? "0.00"}</p>
                      <Badge variant="outline" className={`mt-1 ${statusColors[b.status] || ""}`}>
                        {statusLabels[b.status] || b.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
