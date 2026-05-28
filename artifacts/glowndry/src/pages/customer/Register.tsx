import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WashingMachine, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function CustomerRegister() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary to-primary/80 text-primary-foreground relative overflow-y-auto no-scrollbar">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      
      <Link href="/app/login" className="absolute top-6 left-6 z-20 text-white flex items-center gap-2 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm z-10 flex flex-col items-center mt-12"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create Account</h1>
          <p className="text-primary-foreground/80 font-medium text-sm">Join GlownDry today</p>
        </div>

        <div className="w-full bg-background text-foreground p-6 rounded-3xl shadow-2xl space-y-5 mb-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" className="rounded-xl h-11 bg-muted/50 border-transparent focus:border-primary focus:bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="hello@example.com" className="rounded-xl h-11 bg-muted/50 border-transparent focus:border-primary focus:bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="rounded-xl h-11 bg-muted/50 border-transparent focus:border-primary focus:bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="rounded-xl h-11 bg-muted/50 border-transparent focus:border-primary focus:bg-background" />
            </div>
          </div>

          <Link href="/app/dashboard" className="block w-full pt-2">
            <Button className="w-full rounded-xl h-12 text-base font-semibold shadow-lg shadow-primary/30">
              Register
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
