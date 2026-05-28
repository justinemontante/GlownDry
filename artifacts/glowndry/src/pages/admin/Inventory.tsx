import { AlertTriangle, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const INVENTORY = [
  { id: 1, item: "Premium Detergent (Liquid)", stock: 45, unit: "Liters", threshold: 20, status: "Good" },
  { id: 2, item: "Fabric Softener", stock: 12, unit: "Liters", threshold: 15, status: "Low" },
  { id: 3, item: "Dry Cleaning Solvent", stock: 8, unit: "Gallons", threshold: 10, status: "Low" },
  { id: 4, item: "Packaging Bags (Large)", stock: 500, unit: "Units", threshold: 200, status: "Good" },
  { id: 5, item: "Hangers", stock: 1200, unit: "Units", threshold: 300, status: "Good" },
];

export default function AdminInventory() {
  const lowStockItems = INVENTORY.filter(i => i.status === "Low");

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
          <Input placeholder="Search inventory..." className="pl-9 bg-white" />
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Item Name</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Current Stock</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Unit</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Threshold</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {INVENTORY.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {item.status === "Low" && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                    {item.status === "Good" && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                    {item.item}
                  </div>
                </TableCell>
                <TableCell className="text-center font-bold">{item.stock}</TableCell>
                <TableCell className="text-center text-muted-foreground">{item.unit}</TableCell>
                <TableCell className="text-center text-muted-foreground">{item.threshold}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" className="w-8 h-8 p-0">-</Button>
                    <Button variant="outline" size="sm" className="w-8 h-8 p-0">+</Button>
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
