import { useState, useEffect, useRef } from "react";
import { Plus, Edit2, Trash2, Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Service = {
  id: number;
  name: string;
  description: string;
  pricePerKg: number;
  serviceImage?: string | null;
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
          <div className="relative w-full h-32 rounded-lg overflow-hidden border">
            <img src={value} alt="preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 bg-black/60 rounded-full p-1 hover:bg-black/80 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="w-full h-32 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-muted/20 transition-colors"
          >
            <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
            <span className="text-xs text-muted-foreground/60">Click to upload image</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {value && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs text-primary hover:underline mt-1"
        >
          Change image
        </button>
      )}
    </div>
  );
}

const emptyForm = { name: "", description: "", pricePerKg: 0, serviceImage: "" };

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const token = () => localStorage.getItem("adminToken");

  function load() {
    fetch("/api/services", { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setServices(data); setLoading(false); });
  }

  useEffect(() => { load(); }, []);

  async function save() {
    if (!form.name.trim() || !form.description.trim()) return;
    setSaving(true);
    const isEdit = !!editing;
    const url = isEdit ? `/api/services/${editing!.id}` : "/api/services";
    const method = isEdit ? "PATCH" : "POST";

    const body: Record<string, unknown> = {
      name: form.name.trim(),
      description: form.description.trim(),
      pricePerKg: Number(form.pricePerKg),
    };
    if (form.serviceImage) body.serviceImage = form.serviceImage;
    console.log("[Save] body:", body);

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      setOpen(false);
      setForm(emptyForm);
      setEditing(null);
      load();
    } catch (e) {
      console.error("Save failed", e);
      alert("Error: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/services/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setDeleteTarget(null);
      load();
    } catch (e) {
      console.error("Delete failed", e);
    }
  }

  function openEdit(s: Service) {
    setEditing(s);
    setForm({ name: s.name, description: s.description, pricePerKg: s.pricePerKg, serviceImage: s.serviceImage ?? "" });
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium">Service Name</label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Regular Wash" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the service..." />
              </div>
              <div>
                <label className="text-sm font-medium">Price per kg (₱)</label>
                <Input type="number" min={0} step={1} value={form.pricePerKg} onChange={e => setForm({ ...form, pricePerKg: Number(e.target.value) })} />
              </div>
              <ImageUpload value={form.serviceImage} onChange={url => setForm({ ...form, serviceImage: url })} />
              <Button onClick={save} className="w-full" disabled={saving || !form.name.trim() || !form.description.trim()}>
                {saving ? "Saving..." : editing ? "Update Service" : "Create Service"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map(service => (
          <Card key={service.id} className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="w-full h-44 bg-muted/30 relative">
              {service.serviceImage ? (
                <img
                  src={service.serviceImage}
                  alt={service.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1.5">
                <button
                  onClick={() => openEdit(service)}
                  className="bg-white/90 hover:bg-white rounded-lg p-1.5 shadow-sm transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => setDeleteTarget(service)}
                  className="bg-white/90 hover:bg-white rounded-lg p-1.5 shadow-sm transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-base">{service.name}</h3>
                <span className="text-lg font-bold text-primary whitespace-nowrap ml-2">
                  ₱{service.pricePerKg.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">per kg</p>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{service.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
