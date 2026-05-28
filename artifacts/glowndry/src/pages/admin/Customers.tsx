import { useState, useEffect } from "react";
import { Search, Mail, Phone, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Customer = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  totalOrders: number;
  createdAt: string;
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token = () => localStorage.getItem("adminToken");

  useEffect(() => {
    fetch("/api/customers", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setCustomers(data); setLoading(false); });
  }, []);

  const filtered = search
    ? customers.filter(c =>
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
      )
    : customers;

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading customers...</div>;

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
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {c.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
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
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                    View History <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
