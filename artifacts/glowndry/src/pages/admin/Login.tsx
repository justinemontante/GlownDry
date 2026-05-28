import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid credentials");
      }

      const data = await res.json();
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.admin));
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      <div className="hidden lg:flex flex-1 flex-col items-center justify-start pt-48 text-white p-12 relative overflow-hidden" style={{ backgroundImage: "url(/images/admin/loginImage.png)", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#18967f" }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="z-10 text-center max-w-md">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            <span style={{ color: "#18967f" }}>Glown</span><span style={{ color: "#fff" }}>Dry</span>
          </h1>
          <p className="text-xl text-white/80">
            Smart Laundry Service Management System
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden text-center">
            <h1 className="text-3xl font-bold"><span style={{ color: "#18967f" }}>Glown</span><span className="text-foreground">Dry</span></h1>
          </div>

          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <p className="text-muted-foreground mt-2">Sign in to your admin account to continue.</p>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="admin@glowndry.com"
                    className="h-12"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-12 pr-10"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-destructive font-medium">{error}</p>
                )}
                <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
