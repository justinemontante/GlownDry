import { CreditCard, DollarSign, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const TRANSACTIONS = [
  { id: "TXN-9982", order: "ORD-4829", customer: "Sarah Jenkins", amount: "$20.00", method: "Credit Card", date: "Oct 12, 2023", status: "Success" },
  { id: "TXN-9981", order: "ORD-4830", customer: "Michael Chen", amount: "$45.00", method: "Cash", date: "Oct 12, 2023", status: "Success" },
  { id: "TXN-9980", order: "ORD-4831", customer: "Emma Wilson", amount: "$30.00", method: "Credit Card", date: "Oct 11, 2023", status: "Refunded" },
];

export default function AdminPayments() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-primary text-primary-foreground border-none shadow-md">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-primary-foreground/80 text-sm font-medium">Today's Revenue</p>
              <h3 className="text-2xl font-bold">$485.00</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Card Payments</p>
              <h3 className="text-2xl font-bold">$320.00</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Cash Payments</p>
              <h3 className="text-2xl font-bold">$165.00</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Order Ref</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TRANSACTIONS.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium text-slate-600">{t.id}</TableCell>
                <TableCell className="text-primary font-medium">{t.order}</TableCell>
                <TableCell>{t.customer}</TableCell>
                <TableCell className="font-bold">{t.amount}</TableCell>
                <TableCell className="text-muted-foreground">{t.method}</TableCell>
                <TableCell>
                  {t.status === "Success" ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Refunded</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary">
                    <ReceiptText className="w-4 h-4" />
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
