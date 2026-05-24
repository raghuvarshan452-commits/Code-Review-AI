import { signInWithGoogle } from "@/hooks/useAuth";
import { useState } from "react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" />
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" />
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" />
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z" />
    </svg>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  padding: "0 12px",
  border: "1px solid #E2DED7",
  borderRadius: 8,
  fontSize: 14,
  color: "#1C1917",
  background: "#FAFAF8",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

export default function LoginPage() {
  const initialMode = new URLSearchParams(window.location.search).get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login" ? "login" : "register";
    const body = mode === "login" ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        window.location.href = "/app";
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F6F3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 400,
          background: "#FFFFFF",
          borderRadius: 16,
          border: "1px solid #E2DED7",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: "40px 36px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1A6B3C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1C1917" }}>ReviewBot AI</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#1C1917", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h1>
        <p style={{ fontSize: 14, color: "#78716C", margin: "0 0 28px" }}>
          {mode === "login" ? "Sign in to your account to continue." : "Start reviewing code smarter today."}
        </p>

        {/* Google button */}
        <button
          onClick={signInWithGoogle}
          style={{ width: "100%", height: 42, background: "#FFFFFF", border: "1px solid #E2DED7", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#1C1917", transition: "all 0.15s ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#F7F6F3"; e.currentTarget.style.borderColor = "#C8C3BA"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.borderColor = "#E2DED7"; }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#E2DED7" }} />
          <span style={{ fontSize: 12, color: "#A8A29E", padding: "0 12px" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#E2DED7" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#44403C", display: "block", marginBottom: 5 }}>Full name</label>
              <input type="text" placeholder="John Smith" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#1A6B3C"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#E2DED7"; }} />
            </div>
          )}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#44403C", display: "block", marginBottom: 5 }}>Email address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#1A6B3C"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E2DED7"; }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#44403C", display: "block", marginBottom: 5 }}>Password</label>
            <input type="password" placeholder={mode === "register" ? "At least 8 characters" : "••••••••"} value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#1A6B3C"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#E2DED7"; }} />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "#DC2626", margin: 0, padding: "8px 12px", background: "#FEF2F2", borderRadius: 6 }}>{error}</p>
          )}

          <button type="submit" disabled={loading}
            style={{ width: "100%", height: 42, background: loading ? "#86BCAA" : "#1A6B3C", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 4, transition: "background 0.15s" }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#145c32"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#1A6B3C"; }}>
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p style={{ fontSize: 13, color: "#78716C", textAlign: "center", marginTop: 20, marginBottom: 0 }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            style={{ background: "none", border: "none", color: "#1A6B3C", fontWeight: 600, cursor: "pointer", fontSize: 13, padding: 0 }}>
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>

        <p style={{ fontSize: 11, color: "#A8A29E", textAlign: "center", marginTop: 16, marginBottom: 0 }}>
          By continuing you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
}
