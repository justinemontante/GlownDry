import { ArrowLeft, CheckCircle2, Clock, MapPin, Package, Truck, WashingMachine } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const STEPS = [
  { id: "scheduled", label: "Scheduled", icon: <Clock className="w-5 h-5" />, time: "Today, 09:00 AM", done: true },
  { id: "picked-up", label: "Picked Up", icon: <Truck className="w-5 h-5" />, time: "Today, 09:30 AM", done: true },
  { id: "in-progress", label: "In Progress", icon: <WashingMachine className="w-5 h-5" />, time: "Est. 2h remaining", done: false, active: true },
  { id: "ready", label: "Ready for Delivery", icon: <Package className="w-5 h-5" />, time: "Pending", done: false },
  { id: "delivered", label: "Delivered", icon: <MapPin className="w-5 h-5" />, time: "Pending", done: false },
];

export default function CustomerTracker() {
  return (
    <div className="h-full bg-slate-50 flex flex-col relative overflow-hidden">
      <header className="px-6 pt-12 pb-4 bg-white border-b sticky top-0 z-20 flex items-center gap-4">
        <Link href="/app/dashboard">
          <Button size="icon" variant="ghost" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Order #4829</h1>
          <p className="text-xs text-muted-foreground">Wash & Fold • 5kg</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        
        {/* Status Hero */}
        <div className="bg-primary text-primary-foreground p-6 rounded-3xl shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4"
          >
            <WashingMachine className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-1">In Progress</h2>
          <p className="text-primary-foreground/80 text-sm">Your clothes are being cleaned with care.</p>
        </div>

        {/* Stepper */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border relative">
          <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-slate-100"></div>
          
          <div className="space-y-8 relative">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex gap-4 items-start relative z-10">
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm transition-colors",
                  step.done ? "bg-primary text-white" : step.active ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400"
                )}>
                  {step.done ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                  
                  {step.active && (
                    <motion.div 
                      className="absolute inset-0 rounded-full border-2 border-amber-500"
                      animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                </div>
                <div className="pt-2">
                  <h3 className={cn("font-bold text-sm", step.active ? "text-amber-600" : step.done ? "text-foreground" : "text-muted-foreground")}>
                    {step.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
