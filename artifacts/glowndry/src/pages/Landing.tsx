import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { WashingMachine, Smartphone, Sparkles, ShieldCheck, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <WashingMachine className="w-6 h-6" />
            <span className="text-xl font-bold tracking-tight">GLOWNDRY</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Admin Portal
            </Link>
            <Link href="/app">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto max-w-4xl"
        >
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6">
            <Sparkles className="mr-2 h-4 w-4" />
            Premium Laundry Service
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            Smart Laundry Management <br className="hidden md:block" /> Made Easy
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Experience the future of laundry. Schedule pickups, track your clothes in real-time, and get premium care delivered to your door.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/app">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base">
                <Smartphone className="mr-2 h-5 w-5" /> Open Customer App
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From smart booking to live tracking, we've thought of everything to make your laundry experience seamless.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard 
              icon={<Clock className="w-10 h-10 text-primary" />}
              title="Smart Booking"
              description="Schedule pickups and deliveries at your convenience with our intelligent time slot system."
            />
            <FeatureCard 
              icon={<MapPin className="w-10 h-10 text-primary" />}
              title="Live Tracking"
              description="Know exactly where your clothes are with real-time status updates and delivery tracking."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-10 h-10 text-primary" />}
              title="Premium Care"
              description="Your garments are handled by professionals using industry-leading cleaning technology."
            />
          </div>
        </div>
      </section>

      <footer className="py-12 border-t bg-card text-center text-muted-foreground">
        <div className="container mx-auto px-4 flex items-center justify-center gap-2">
          <WashingMachine className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">GLOWNDRY</span>
          <span>© 2025 All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-card border shadow-sm flex flex-col items-center text-center"
    >
      <div className="mb-6 p-4 rounded-full bg-primary/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
