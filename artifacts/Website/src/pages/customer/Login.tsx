import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WashingMachine } from "lucide-react";
import { motion } from "framer-motion";

export default function CustomerLogin() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm z-10 flex flex-col items-center"
      >
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md mb-4 shadow-lg">
            <WashingMachine className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">GlownDry</h1>
          <p className="text-primary-foreground/80 font-medium">Premium Laundry, Delivered</p>
        </div>

        <div className="w-full bg-background text-foreground p-6 rounded-3xl shadow-2xl space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="hello@example.com" className="rounded-xl h-12 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-primary font-medium">Forgot?</Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" className="rounded-xl h-12 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-colors" />
            </div>
          </div>

          <Link href="/app/dashboard" className="block w-full">
            <Button className="w-full rounded-xl h-12 text-base font-semibold shadow-lg shadow-primary/30">
              Sign In
            </Button>
          </Link>

          <div className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/app/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
