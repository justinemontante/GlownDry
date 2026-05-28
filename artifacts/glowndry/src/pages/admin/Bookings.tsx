import { useState } from "react";
import { Search, Filter, MoreHorizontal, CheckCircle, Clock, WashingMachine, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MOCK_BOOKINGS = [
  { id: "ORD-4829", customer: "Sarah Jenkins", service: "Wash & Fold", weight: "5kg", total: "$20.00", status: "In Progress" },
  { id: "ORD-4830", customer: "Michael Chen", service: "Dry Cleaning", weight: "3 items", total: "$45.00", status: "Scheduled" },
  { id: "ORD-4831", customer: "Emma Wilson", service: "Iron & Press", weight: "10 items", total: "$30.00", status: "Ready" },
  { id: "ORD-4832", customer: "David Brown", service: "Wash & Fold", weight: "8kg", total: "$32.00", status: "Claimed" },
];

export default function AdminBookings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-9 bg-white" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="progress">In Progress</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="claimed">Claimed</SelectItem>
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
            {MOCK_BOOKINGS.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium">{booking.id}</TableCell>
                <TableCell>{booking.customer}</TableCell>
                <TableCell>{booking.service}</TableCell>
                <TableCell className="text-muted-foreground">{booking.weight}</TableCell>
                <TableCell className="font-medium">{booking.total}</TableCell>
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
  switch (status) {
    case "Scheduled":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1"/> Scheduled</Badge>;
    case "In Progress":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200"><WashingMachine className="w-3 h-3 mr-1"/> In Progress</Badge>;
    case "Ready":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1"/> Ready</Badge>;
    case "Claimed":
      return <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200"><Package className="w-3 h-3 mr-1"/> Claimed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
