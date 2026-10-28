"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOS } from "../store/os-store";
import { api } from "../lib/api";
import { initSocket } from "../lib/socket";
import { Lock, Mail, User, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, setUser, backendOnline, refreshCustomApps } = useOS();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!authModalOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === "register") {
        if (!name.trim()) throw new Error("Please enter your name");
        if (password.length < 8) throw new Error("Password must be at least 8 characters");
        const res = await api.auth.register(name.trim(), email.trim(), password);
        setUser(res.user);
        setSuccess(`Welcome to Door OS, ${res.user.name}!`);
      } else {
        const res = await api.auth.login(email.trim(), password);
        setUser(res.user);
        setSuccess(`Welcome back, ${res.user.name}!`);
      }

      // Initialize socket with token
      initSocket();
      refreshCustomApps();

      setTimeout(() => {
        setAuthModalOpen(false);
        setSuccess(null);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed. Make sure the backend server is running.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="welcome-shade"
        style={{ zIndex: 1100 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.section
          className="welcome auth-dialog"
          style={{ width: 440, textAlign: "left", padding: "30px 32px" }}
          initial={{ y: 25, scale: 0.96 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 20, scale: 0.96 }}
        >
          <button
            className="x"
            onClick={() => setAuthModalOpen(false)}
            aria-label="Close"
          >
            ×
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div className="door-mark tiny" style={{ width: 40, height: 40, borderRadius: 12, fontSize: 22 }}>
              D<span>·</span>
            </div>
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>DOOR OS CLOUD ACCOUNT</p>
              <h3 style={{ margin: 0, font: "700 19px Manrope", letterSpacing: "-0.5px" }}>
                {mode === "login" ? "Sign in to your space" : "Create your OS account"}
              </h3>
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 18, background: "var(--field)", padding: 4, borderRadius: 10 }}>
            <button
              type="button"
              onClick={() => { setMode("login"); setError(null); }}
              style={{
                flex: 1,
                border: 0,
                padding: "8px 0",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                background: mode === "login" ? "#a78bfa" : "transparent",
                color: mode === "login" ? "#1e1738" : "var(--muted)",
                transition: "all 0.2s"
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(null); }}
              style={{
                flex: 1,
                border: 0,
                padding: "8px 0",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                background: mode === "register" ? "#a78bfa" : "transparent",
                color: mode === "register" ? "#1e1738" : "var(--muted)",
                transition: "all 0.2s"
              }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {mode === "register" && (
              <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 11, color: "var(--muted)" }}>
                Full Name
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--field)", border: "1px solid var(--line)", borderRadius: 10 }}>
                  <User size={14} color="#a78bfa" />
                  <input
                    type="text"
                    required
                    placeholder="Ada Lovelace"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ background: "transparent", border: 0, outline: 0, color: "var(--text)", width: "100%", fontSize: 12 }}
                  />
                </div>
              </label>
            )}

            <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 11, color: "var(--muted)" }}>
              Email Address
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--field)", border: "1px solid var(--line)", borderRadius: 10 }}>
                <Mail size={14} color="#a78bfa" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ background: "transparent", border: 0, outline: 0, color: "var(--text)", width: "100%", fontSize: 12 }}
                />
              </div>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 11, color: "var(--muted)" }}>
              Password
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "var(--field)", border: "1px solid var(--line)", borderRadius: 10 }}>
                <Lock size={14} color="#a78bfa" />
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ background: "transparent", border: 0, outline: 0, color: "var(--text)", width: "100%", fontSize: 12 }}
                />
              </div>
            </label>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "#ef444422", border: "1px solid #ef444455", borderRadius: 9, color: "#fca5a5", fontSize: 11 }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: "#10b98122", border: "1px solid #10b98155", borderRadius: 9, color: "#6ee7b7", fontSize: 11 }}>
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="primary"
              style={{ width: "100%", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? "Connecting..." : mode === "login" ? "Sign In to Door OS" : "Register & Start"}
              {!loading && <Sparkles size={14} />}
            </button>
          </form>

          <div style={{ marginTop: 18, borderTop: "1px solid var(--line)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, color: "var(--muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: backendOnline ? "#22c55e" : "#eab308", display: "inline-block" }} />
              {backendOnline ? "API Online (MongoDB Ready)" : "Local Mode (Backend Idle)"}
            </span>
            <button
              type="button"
              className="quiet"
              style={{ margin: 0, padding: 0, textDecoration: "underline" }}
              onClick={() => setAuthModalOpen(false)}
            >
              Continue as Guest
            </button>
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}
