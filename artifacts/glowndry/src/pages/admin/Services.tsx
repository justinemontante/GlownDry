import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Service = {
  id: number;
  name: string;
  description: string;
  pricePerKg: number;
  imageUrl?: string | null;
};

function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <label className="text-sm font-medium">Service Image</label>
      <div className="flex items-center gap-3 mt-1">
        {value ? (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
            <img src={value} alt="preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/40 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 transition-colors"
          >
            <Upload className="w-5 h-5 text-muted-foreground/60" />
            <span className="text-[10px] text-muted-foreground/60">Upload</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {value && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs text-primary hover:underline"
          >
            Change
          </button>
        )}
      </div>
    </div>
  );
}

const emptyForm = { name: "", description: "", pricePerKg: 0, imageUrl: "" };

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);

  const token = () => localStorage.getItem("adminToken");

  function load() {
    fetch("/api/services", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setServices(data); setLoading(false); });
  }

  useEffect(() => { load(); }, []);

  async function save() {
    const isEdit = !!editing;
    const url = isEdit ? `/api/services/${editing!.id}` : "/api/services";
    const method = isEdit ? "PATCH" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      body: JSON.stringify(isEdit ? form : { ...form, pricePerKg: Number(form.pricePerKg), imageUrl: form.imageUrl || undefined }),
    });

    setOpen(false);
    setForm(emptyForm);
    setEditing(null);
    load();
  }

  async function remove(id: number) {
    await fetch(`/api/services/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    load();
  }

  function openEdit(s: Service) {
    setEditing(s);
    setForm({ name: s.name, description: s.description, pricePerKg: s.pricePerKg, imageUrl: s.imageUrl ?? "" });
    setOpen(true);
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading services...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Menu</h2>
          <p className="text-muted-foreground">Manage your laundry services and pricing.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" /> Add Service</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Service Name</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Price per kg (₱)</label>
                <Input type="number" value={form.pricePerKg} onChange={e => setForm({ ...form, pricePerKg: Number(e.target.value) })} />
              </div>
              <ImageUpload value={form.imageUrl} onChange={url => setForm({ ...form, imageUrl: url })} />
              <Button onClick={save} className="w-full">{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map(service => (
          <Card key={service.id} className="border-none shadow-sm hover:shadow-md transition-shadow relative group overflow-hidden">
            {service.imageUrl && (
              <div className="w-full h-40 overflow-hidden">
                <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <div className="text-right">
                  <span className="font-bold text-lg text-primary">₱{service.pricePerKg.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground block">per kg</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm line-clamp-2">{service.description}</CardDescription>
            </CardContent>
            <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-xl">
              <Button variant="secondary" size="sm" onClick={() => openEdit(service)}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => remove(service.id)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
