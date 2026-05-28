import { useState, useEffect } from "react";
import { AlertTriangle, Plus, Search, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

type InventoryItem = {
  id: number;
  item: string;
  stock: number;
  unit: string;
  threshold: number;
};

export default function AdminInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({ item: "", stock: "", unit: "", threshold: "" });

  const token = () => localStorage.getItem("adminToken");

  function load() {
    fetch("/api/inventory", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false); });
  }

  useEffect(() => { load(); }, []);

  const filtered = items.filter(i =>
    !search || i.item.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = items.filter(i => i.stock <= i.threshold);

  function openEdit(item: InventoryItem) {
    setSelected(item);
    setForm({ item: item.item, stock: String(item.stock), unit: item.unit, threshold: String(item.threshold) });
    setEditOpen(true);
  }

  function openDelete(item: InventoryItem) {
    setSelected(item);
    setDeleteOpen(true);
  }

  function resetForm() {
    setForm({ item: "", stock: "", unit: "", threshold: "" });
  }

  async function handleAdd() {
    await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({
        item: form.item,
        stock: Number(form.stock) || 0,
        unit: form.unit,
        threshold: Number(form.threshold) || 0,
      }),
    });
    setAddOpen(false);
    resetForm();
    load();
  }

  async function handleEdit() {
    if (!selected) return;
    await fetch(`/api/inventory/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({
        item: form.item,
        stock: Number(form.stock) || 0,
        unit: form.unit,
        threshold: Number(form.threshold) || 0,
      }),
    });
    setEditOpen(false);
    setSelected(null);
    load();
  }

  async function handleDelete() {
    if (!selected) return;
    await fetch(`/api/inventory/${selected.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    setDeleteOpen(false);
    setSelected(null);
    load();
  }

  async function adjustStock(item: InventoryItem, delta: number) {
    await fetch(`/api/inventory/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ stock: Math.max(0, item.stock + delta) }),
    });
    load();
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>;

  return (
    <div className="space-y-6">
      {lowStockItems.length > 0 && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
          <AlertTriangle className="h-4 w-4" color="currentColor" />
          <AlertTitle>Low Stock Warning</AlertTitle>
          <AlertDescription>
            {lowStockItems.length} items have fallen below their minimum threshold. Please reorder soon.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search inventory..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Dialog open={addOpen} onOpenChange={v => { setAddOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Item Name</Label>
                <Input value={form.item} onChange={e => setForm({ ...form, item: e.target.value })} />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div>
                <Label>Unit</Label>
                <Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="Liters, Units, Gallons..." />
              </div>
              <div>
                <Label>Threshold</Label>
                <Input type="number" value={form.threshold} onChange={e => setForm({ ...form, threshold: e.target.value })} />
              </div>
              <Button className="w-full" onClick={handleAdd}>Add Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Item Name</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Current Stock</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Unit</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Threshold</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No inventory items found</TableCell>
              </TableRow>
            )}
            {filtered.map((item) => {
              const isLow = item.stock <= item.threshold;
              return (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isLow ? "bg-red-500" : "bg-green-500"}`}></span>
                      {item.item}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold">{item.stock}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{item.unit}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{item.threshold}</TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isLow ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                    }`}>
                      {isLow ? "Low" : "Good"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="outline" size="sm" className="w-7 h-7 p-0" onClick={() => adjustStock(item, -1)} title="Decrease stock">−</Button>
                      <Button variant="outline" size="sm" className="w-7 h-7 p-0" onClick={() => adjustStock(item, 1)} title="Increase stock">+</Button>
                      <Button variant="ghost" size="sm" className="w-7 h-7 p-0" onClick={() => openEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="w-7 h-7 p-0 text-red-500 hover:text-red-700" onClick={() => openDelete(item)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={editOpen} onOpenChange={v => { setEditOpen(v); if (!v) setSelected(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Edit Inventory Item</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Item Name</Label>
              <Input value={form.item} onChange={e => setForm({ ...form, item: e.target.value })} />
            </div>
            <div>
              <Label>Stock</Label>
              <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div>
              <Label>Unit</Label>
              <Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div>
              <Label>Threshold</Label>
              <Input type="number" value={form.threshold} onChange={e => setForm({ ...form, threshold: e.target.value })} />
            </div>
            <Button className="w-full" onClick={handleEdit}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={v => { setDeleteOpen(v); if (!v) setSelected(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Item</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete <strong>{selected?.item}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
