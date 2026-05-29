import { useState, useEffect } from "react";
import { CreditCard, DollarSign, ReceiptText, Plus, Printer, X, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Payment = {
  id: number;
  bookingId: number;
  amount: number;
  cashReceived: number;
  change: number;
  customerName: string | null;
  method: string;
  status: string;
  createdAt: string;
};

type Booking = {
  id: number;
  customerName: string | null;
  totalAmount: number | null;
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [form, setForm] = useState({ bookingId: "", amount: "", cashReceived: "", method: "cash" });

  const token = () => localStorage.getItem("adminToken");

  function load() {
    Promise.all([
      fetch("/api/payments", { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()),
      fetch("/api/bookings", { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()),
    ]).then(([p, b]) => {
      setPayments(p);
      setBookings(b);
      setLoading(false);
    });
  }

  useEffect(() => { load(); }, []);

  const change = Number(form.cashReceived) - Number(form.amount);

  async function createPayment() {
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({
        bookingId: Number(form.bookingId),
        amount: Number(form.amount),
        cashReceived: Number(form.cashReceived),
        method: form.method,
      }),
    });
    setOpen(false);
    setForm({ bookingId: "", amount: "", cashReceived: "", method: "cash" });
    load();
  }

  function selectBooking(id: string) {
    const b = bookings.find(x => x.id === Number(id));
    setForm({ ...form, bookingId: id, amount: b?.totalAmount ? String(b.totalAmount) : "" });
  }

  const todayRevenue = payments
    .filter(p => p.status !== "refunded" && new Date(p.createdAt).toDateString() === new Date().toDateString())
    .reduce((s, p) => s + p.amount, 0);
  const cardTotal = payments.filter(p => p.method === "card" && p.status !== "refunded").reduce((s, p) => s + p.amount, 0);
  const cashTotal = payments.filter(p => p.method === "cash" && p.status !== "refunded").reduce((s, p) => s + p.amount, 0);

  const downloadReceiptPDF = () => { window.print(); };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading payments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          <Card className="bg-primary text-primary-foreground border-none shadow-md">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><DollarSign className="w-6 h-6" /></div>
              <div>
                <p className="text-primary-foreground/80 text-sm font-medium">Today's Revenue</p>
                <h3 className="text-2xl font-bold">₱{todayRevenue.toFixed(2)}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center"><CreditCard className="w-6 h-6 text-slate-600" /></div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Card Payments</p>
                <h3 className="text-2xl font-bold">₱{cardTotal.toFixed(2)}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center"><DollarSign className="w-6 h-6 text-slate-600" /></div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Cash Payments</p>
                <h3 className="text-2xl font-bold">₱{cashTotal.toFixed(2)}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="ml-4"><Plus className="w-4 h-4 mr-2" /> New Payment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Booking</Label>
                <Select value={form.bookingId} onValueChange={selectBooking}>
                  <SelectTrigger><SelectValue placeholder="Select booking" /></SelectTrigger>
                  <SelectContent>
                    {bookings.filter(b => b.totalAmount).map(b => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        ORD-{String(b.id).padStart(4, "0")} — {b.customerName || `#${b.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={form.method} onValueChange={m => setForm({ ...form, method: m })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card / Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount (₱)</Label>
                <Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <Label>Cash Received (₱)</Label>
                <Input type="number" value={form.cashReceived} onChange={e => setForm({ ...form, cashReceived: e.target.value })} />
              </div>
              {form.cashReceived && Number(form.cashReceived) > 0 && (
                <div className={`p-3 rounded-lg text-center text-lg font-bold ${change >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {change >= 0 ? `Change: ₱${change.toFixed(2)}` : `Short: ₱${Math.abs(change).toFixed(2)}`}
                </div>
              )}
              <Button className="w-full" onClick={createPayment} disabled={!form.bookingId || !form.amount || !form.cashReceived}>
                Record Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No payments recorded</TableCell>
              </TableRow>
            )}
            {payments.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium text-slate-600">TXN-{String(t.id).padStart(4, "0")}</TableCell>
                <TableCell className="text-primary font-medium">ORD-{String(t.bookingId).padStart(4, "0")}</TableCell>
                <TableCell>{t.customerName || "—"}</TableCell>
                <TableCell className="font-bold">₱{t.amount.toFixed(2)}</TableCell>
                <TableCell className="text-muted-foreground capitalize">{t.method}</TableCell>
                <TableCell>
                  {t.status === "refunded" ? (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Refunded</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary" onClick={() => setReceiptPayment(t)}>
                    <ReceiptText className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={!!receiptPayment} onOpenChange={() => setReceiptPayment(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="bg-primary p-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">GlownDry</h2>
                <p className="text-primary-foreground/80 text-sm">Laundry Service Receipt</p>
              </div>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20" onClick={() => setReceiptPayment(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          {receiptPayment && (
            <div className="p-6 space-y-6" id="receipt-content">
              <div className="text-center border-b border-slate-100 pb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Transaction</p>
                <p className="text-2xl font-bold text-foreground">TXN-{String(receiptPayment.id).padStart(4, "0")}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(receiptPayment.createdAt).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Reference</span>
                  <span className="font-medium">ORD-{String(receiptPayment.bookingId).padStart(4, "0")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{receiptPayment.customerName || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium capitalize">{receiptPayment.method}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-bold text-lg text-green-600">₱{receiptPayment.amount.toFixed(2)}</span>
                </div>
                {receiptPayment.method === "cash" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cash Received</span>
                      <span className="font-medium">₱{receiptPayment.cashReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Change</span>
                      <span className="font-bold text-primary">₱{receiptPayment.change.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Success</Badge>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-muted-foreground">Thank you for choosing GlownDry!</p>
                <p className="text-xs text-muted-foreground mt-1">₱{receiptPayment.amount.toFixed(2)} • {(receiptPayment.method || "CASH").toUpperCase()} • {new Date(receiptPayment.createdAt).toLocaleDateString("en-PH")}</p>
              </div>

              <div className="flex gap-3 receipt-actions">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => { window.print(); }}>
                  <Printer className="w-4 h-4" /> Print
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={downloadReceiptPDF}>
                  <Download className="w-4 h-4" /> Download
                </Button>
                <Button className="flex-1" onClick={() => setReceiptPayment(null)}>Done</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
