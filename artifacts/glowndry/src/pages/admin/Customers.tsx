import { Search, Mail, Phone, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CUSTOMERS = [
  { id: 1, name: "Sarah Jenkins", email: "sarah@example.com", phone: "+1 (555) 123-4567", orders: 12, lastOrder: "Oct 12, 2023" },
  { id: 2, name: "Michael Chen", email: "mchen@example.com", phone: "+1 (555) 987-6543", orders: 4, lastOrder: "Oct 10, 2023" },
  { id: 3, name: "Emma Wilson", email: "emma.w@example.com", phone: "+1 (555) 456-7890", orders: 28, lastOrder: "Oct 08, 2023" },
  { id: 4, name: "David Brown", email: "dbrown@example.com", phone: "+1 (555) 234-5678", orders: 1, lastOrder: "Oct 01, 2023" },
];

export default function AdminCustomers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search customers by name, email, or phone..." className="pl-9 bg-white" />
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
              <TableHead className="font-semibold text-slate-600">Last Order</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CUSTOMERS.map((c) => (
              <TableRow key={c.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {c.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <span className="font-medium">{c.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1 text-muted-foreground">
                    <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {c.email}</div>
                    <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {c.phone}</div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-semibold text-primary">{c.orders}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.lastOrder}</TableCell>
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
