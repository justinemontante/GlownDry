import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const SERVICES = [
  { id: 1, name: "Wash & Fold", price: "$4.00", unit: "per kg", desc: "Standard washing, drying, and folding of everyday clothes." },
  { id: 2, name: "Dry Cleaning", price: "$12.00", unit: "per item", desc: "Professional dry cleaning for suits, dresses, and delicate fabrics." },
  { id: 3, name: "Iron & Press", price: "$3.00", unit: "per item", desc: "Professional ironing and pressing for a crisp finish." },
  { id: 4, name: "Express 24h", price: "$10.00", unit: "add-on", desc: "Guaranteed 24-hour turnaround time for any service." },
  { id: 5, name: "Shoe Cleaning", price: "$15.00", unit: "per pair", desc: "Deep cleaning and conditioning for sneakers and leather shoes." },
  { id: 6, name: "Heavy Bedding", price: "$25.00", unit: "per item", desc: "Specialized cleaning for comforters, duvets, and heavy blankets." },
];

export default function AdminServices() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Menu</h2>
          <p className="text-muted-foreground">Manage your laundry services and pricing.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {SERVICES.map(service => (
          <Card key={service.id} className="border-none shadow-sm hover:shadow-md transition-shadow relative group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <div className="text-right">
                  <span className="font-bold text-lg text-primary">{service.price}</span>
                  <span className="text-xs text-muted-foreground block">{service.unit}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm line-clamp-2">
                {service.desc}
              </CardDescription>
            </CardContent>
            
            {/* Hover Actions */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-xl">
              <Button variant="secondary" size="sm">
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
