import { useState } from "react";
import { WashingMachine, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay },
  }),
};

const slideLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: 80 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.8, ease: "easeOut", delay: 0.15 },
  },
};

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
    <div className="h-screen w-full flex overflow-hidden">
      {/* Left - Image Background */}
      <motion.div
        variants={slideLeft}
        initial="hidden"
        animate="visible"
        className="hidden lg:flex flex-1 flex-col items-center justify-end pb-16 text-white p-12 relative overflow-hidden"
        style={{ backgroundImage: "url(/images/admin/loginImage.png)", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#18967f" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="absolute top-8 left-8 z-10"
        >
          <WashingMachine className="w-12 h-12 text-white" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="z-10 text-center max-w-md"
        >
          <h1 className="text-4xl 2xl:text-5xl font-bold tracking-tight mb-4">
            <span style={{ color: "#18967f" }}>Glown</span><span style={{ color: "#fff" }}>Dry</span>
          </h1>
          <p className="text-lg 2xl:text-xl text-white/80">
            Smart Laundry Service Management System
          </p>
        </motion.div>
      </motion.div>

      {/* Right - Login Card */}
      <motion.div
        variants={slideRight}
        initial="hidden"
        animate="visible"
        className="flex-1 flex items-center justify-center p-4 lg:p-8 h-full"
        style={{ backgroundColor: "#f0f4f8" }}
      >
        <div className="w-full max-w-md max-h-full overflow-y-auto py-4 scrollbar-none">
          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 p-6 lg:p-10 space-y-6 lg:space-y-8">
            {/* Branding */}
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-center space-y-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
                className="inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 rounded-xl mx-auto"
                style={{ background: "linear-gradient(135deg, #00C6B5, #006D96)" }}
              >
                <WashingMachine className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
              </motion.div>
              <div>
                <motion.h1
                  custom={0.2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="text-xl lg:text-2xl font-bold tracking-wide"
                  style={{ color: "#1a2a3a" }}
                >
                  GLOWNDRY
                </motion.h1>
                <motion.p
                  custom={0.3}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="text-xs lg:text-sm tracking-[0.25em] font-semibold mt-1"
                  style={{ color: "#00C6B5" }}
                >
                  A D M I N
                </motion.p>
              </div>
            </motion.div>

            {/* Greeting */}
            <motion.div
              custom={0.4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="space-y-1"
            >
              <h2 className="text-xl lg:text-2xl font-bold" style={{ color: "#1a2a3a" }}>Welcome back</h2>
              <p className="text-sm" style={{ color: "#8a94a6" }}>Sign in to your admin account to continue.</p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 32 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="h-0.5 rounded-full mt-3"
                style={{ backgroundColor: "#00C6B5" }}
              ></motion.div>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
              <motion.div
                custom={0.5}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="space-y-1.5"
              >
                <label className="text-xs lg:text-sm font-semibold" style={{ color: "#1a2a3a" }}>Email Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#e8f4f4" }}>
                    <Mail className="w-3.5 h-3.5 lg:w-4 lg:h-4" style={{ color: "#00C6B5" }} />
                  </div>
                  <input
                    type="email"
                    placeholder="admin@glowndry.com"
                    className="w-full h-10 lg:h-12 pl-12 lg:pl-14 pr-4 rounded-xl border text-xs lg:text-sm outline-none transition-all duration-300 focus:shadow-lg focus:shadow-teal-100"
                    style={{ borderColor: "#e2e8f0", backgroundColor: "#fff", color: "#1a2a3a" }}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    onFocus={e => { e.target.style.borderColor = "#00C6B5"; e.target.style.boxShadow = "0 0 0 3px rgba(0,198,181,0.15)"; }}
                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </motion.div>

              <motion.div
                custom={0.6}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="space-y-1.5"
              >
                <label className="text-xs lg:text-sm font-semibold" style={{ color: "#1a2a3a" }}>Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#e8f4f4" }}>
                    <Lock className="w-3.5 h-3.5 lg:w-4 lg:h-4" style={{ color: "#00C6B5" }} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full h-10 lg:h-12 pl-12 lg:pl-14 pr-10 lg:pr-12 rounded-xl border text-xs lg:text-sm outline-none transition-all duration-300 focus:shadow-lg focus:shadow-teal-100"
                    style={{ borderColor: "#e2e8f0", backgroundColor: "#fff", color: "#1a2a3a" }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    onFocus={e => { e.target.style.borderColor = "#00C6B5"; e.target.style.boxShadow = "0 0 0 3px rgba(0,198,181,0.15)"; }}
                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#8a94a6" }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                custom={0.7}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-2.5"
              >
                <button
                  type="button"
                  onClick={() => setRemember(!remember)}
                  className="w-4 h-4 lg:w-5 lg:h-5 rounded-md flex items-center justify-center transition-all duration-200 border"
                  style={{
                    backgroundColor: remember ? "#00C6B5" : "transparent",
                    borderColor: remember ? "#00C6B5" : "#d1d5db",
                  }}
                >
                  {remember && (
                    <svg className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className="text-xs lg:text-sm" style={{ color: "#8a94a6" }}>Remember me</span>
              </motion.div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs lg:text-sm font-medium"
                  style={{ color: "#dc2626" }}
                >
                  {error}
                </motion.p>
              )}

              <motion.div
                custom={0.8}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl flex items-center justify-center gap-2 lg:gap-3 text-white font-bold text-sm lg:text-base transition-all duration-300 hover:shadow-xl hover:shadow-teal-200/50 active:scale-[0.98] disabled:opacity-70"
                  style={{ background: "linear-gradient(135deg, #00C6B5, #006D96)", padding: "12px 0" }}
                >
                  <Lock className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  {loading ? "Signing in..." : "Sign In"}
                  <motion.div
                    animate={{ x: loading ? 0 : [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 2 }}
                  >
                    <ArrowRight className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  </motion.div>
                </button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              custom={0.9}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="relative flex items-center justify-center pt-2"
            >
              <div className="absolute w-full border-t" style={{ borderColor: "#f0f0f0" }}></div>
              <div className="relative flex flex-col items-center gap-1 lg:gap-2" style={{ backgroundColor: "#fff", padding: "0 16px" }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1.2, type: "spring" }}
                  className="w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#f0fdfa" }}
                >
                  <ShieldCheck className="w-3 h-3 lg:w-4 lg:h-4" style={{ color: "#00C6B5" }} />
                </motion.div>
                <p className="text-xs" style={{ color: "#c0c8d4" }}>Protected by GlownDry System</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
