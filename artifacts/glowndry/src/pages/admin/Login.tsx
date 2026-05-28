import { useState } from "react";
import { WashingMachine, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

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
      <div className="hidden lg:flex flex-1 flex-col items-center justify-end pb-16 text-white p-12 relative overflow-hidden" style={{ backgroundImage: "url(/images/admin/loginImage.png)", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#18967f" }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <WashingMachine className="absolute top-8 left-8 w-12 h-12 text-white z-10" />
        <div className="z-10 text-center max-w-md">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            <span style={{ color: "#18967f" }}>Glown</span><span style={{ color: "#fff" }}>Dry</span>
          </h1>
          <p className="text-xl text-white/80">
            Smart Laundry Service Management System
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: "#f0f4f8" }}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 p-10 space-y-8">
            {/* Branding */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl" style={{ background: "linear-gradient(135deg, #00C6B5, #006D96)" }}>
                <WashingMachine className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-wide" style={{ color: "#1a2a3a" }}>GLOWNDRY</h1>
                <p className="text-sm tracking-[0.25em] font-semibold mt-1" style={{ color: "#00C6B5" }}>A D M I N</p>
              </div>
            </div>

            {/* Greeting */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold" style={{ color: "#1a2a3a" }}>Welcome back</h2>
              <p className="text-sm" style={{ color: "#8a94a6" }}>Sign in to your admin account to continue.</p>
              <div className="w-8 h-0.5 rounded-full mt-3" style={{ backgroundColor: "#00C6B5" }}></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "#1a2a3a" }}>Email Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#e8f4f4" }}>
                    <Mail className="w-4 h-4" style={{ color: "#00C6B5" }} />
                  </div>
                  <input
                    type="email"
                    placeholder="admin@glowndry.com"
                    className="w-full h-12 pl-14 pr-4 rounded-xl border text-sm outline-none transition-colors"
                    style={{ borderColor: "#e2e8f0", backgroundColor: "#fff", color: "#1a2a3a" }}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    onFocus={e => e.target.style.borderColor = "#00C6B5"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "#1a2a3a" }}>Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#e8f4f4" }}>
                    <Lock className="w-4 h-4" style={{ color: "#00C6B5" }} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full h-12 pl-14 pr-12 rounded-xl border text-sm outline-none transition-colors"
                    style={{ borderColor: "#e2e8f0", backgroundColor: "#fff", color: "#1a2a3a" }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    onFocus={e => e.target.style.borderColor = "#00C6B5"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#8a94a6" }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setRemember(!remember)}
                  className="w-5 h-5 rounded-md flex items-center justify-center transition-colors border"
                  style={{
                    backgroundColor: remember ? "#00C6B5" : "transparent",
                    borderColor: remember ? "#00C6B5" : "#d1d5db",
                  }}
                >
                  {remember && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className="text-sm" style={{ color: "#8a94a6" }}>Remember me</span>
              </div>

              {error && (
                <p className="text-sm font-medium" style={{ color: "#dc2626" }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl flex items-center justify-center gap-3 text-white font-bold text-base transition-opacity disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #00C6B5, #006D96)", padding: "14px 0" }}
              >
                <Lock className="w-4 h-4" />
                {loading ? "Signing in..." : "Sign In"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Footer */}
            <div className="relative flex items-center justify-center pt-2">
              <div className="absolute w-full border-t" style={{ borderColor: "#f0f0f0" }}></div>
              <div className="relative flex flex-col items-center gap-2" style={{ backgroundColor: "#fff", padding: "0 16px" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#f0fdfa" }}>
                  <ShieldCheck className="w-4 h-4" style={{ color: "#00C6B5" }} />
                </div>
                <p className="text-xs" style={{ color: "#c0c8d4" }}>Protected by GlownDry System</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
