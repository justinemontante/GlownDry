import { Bell, Search, WashingMachine, CalendarCheck, Clock, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function CustomerDashboard() {
  return (
    <div className="h-full bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 bg-white rounded-b-[2rem] shadow-sm relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Good morning,</p>
            <h1 className="text-2xl font-bold text-foreground">Sarah</h1>
          </div>
          <Button size="icon" variant="ghost" className="rounded-full bg-slate-100 hover:bg-slate-200">
            <Bell className="w-5 h-5 text-foreground" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="w-full h-12 bg-slate-100 rounded-2xl pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-6">
        
        {/* Active Order Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/app/tracker">
            <Card className="border-none shadow-md overflow-hidden cursor-pointer relative bg-primary text-primary-foreground">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">In Progress</span>
                  <span className="font-semibold text-sm">#ORD-4829</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Wash & Fold</h3>
                    <p className="text-primary-foreground/80 text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Ready today, 5:00 PM
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <WashingMachine className="w-6 h-6 text-white animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-lg font-bold mb-4">Services</h2>
          <div className="grid grid-cols-2 gap-4">
            <ServiceCard title="Wash & Fold" icon={<WashingMachine className="w-6 h-6 text-primary" />} price="$4/kg" />
            <ServiceCard title="Dry Cleaning" icon={<SparklesIcon className="w-6 h-6 text-blue-500" />} price="From $12" />
            <ServiceCard title="Ironing" icon={<Wind className="w-6 h-6 text-amber-500" />} price="$3/item" />
            <ServiceCard title="Shoe Care" icon={<ShoeIcon className="w-6 h-6 text-purple-500" />} price="From $15" />
          </div>
        </div>

      </div>

      {/* FAB */}
      <Link href="/app/booking">
        <Button size="icon" className="absolute bottom-24 right-6 w-14 h-14 rounded-full shadow-xl shadow-primary/30 z-50 hover:scale-105 transition-transform">
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}

function ServiceCard({ title, icon, price }: { title: string, icon: React.ReactNode, price: string }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-2xl overflow-hidden">
      <CardContent className="p-4 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-sm text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{price}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Minimal icon placeholders for ones not imported
function SparklesIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
}

function Wind(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
}

function ShoeIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}><path d="m12 8-5.6 5.6a2 2 0 0 0-.4 2.4l1.2 2a2 2 0 0 0 1.6.8h7.2a2 2 0 0 0 1.6-.8l1.2-2a2 2 0 0 0-.4-2.4L12 8Z"/></svg>
}
