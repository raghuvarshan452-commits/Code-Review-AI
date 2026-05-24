import { useReviewStore } from "@/store/useReviewStore";
import { usePRSubmit } from "@/hooks/usePRSubmit";
import { useAuth, signOut } from "@/hooks/useAuth";
import { Search, Bell, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";

function LogoMark() {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 liquid-glass"
      style={{ background: "rgba(255,255,255,0.08)" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function UserMenu({ name, image }: { name: string; image: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 32, height: 32, borderRadius: "50%", overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {image ? (
          <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 500, fontFamily: "Barlow, sans-serif" }}>{initials}</span>
        )}
      </button>

      {open && (
        <div
          className="glass-card"
          style={{
            position: "absolute", right: 0, top: 44, width: 192, padding: 8, zIndex: 200,
          }}
        >
          <div style={{ padding: "6px 12px 10px" }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)", margin: 0, fontFamily: "Barlow, sans-serif" }}>{name}</p>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
          <button
            onClick={() => { setOpen(false); setLocation("/app"); }}
            style={{
              width: "100%", textAlign: "left", fontSize: 13, color: "rgba(255,255,255,0.55)",
              padding: "8px 12px", borderRadius: 8, border: "none", background: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              fontFamily: "Barlow, sans-serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
          >
            <LayoutDashboard style={{ width: 13, height: 13 }} />
            Dashboard
          </button>
          <button
            onClick={() => { setOpen(false); setLocation("/settings"); }}
            style={{
              width: "100%", textAlign: "left", fontSize: 13, color: "rgba(255,255,255,0.55)",
              padding: "8px 12px", borderRadius: 8, border: "none", background: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              fontFamily: "Barlow, sans-serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
          >
            <Settings style={{ width: 13, height: 13 }} />
            Settings
          </button>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
          <button
            onClick={() => { setOpen(false); signOut(); }}
            style={{
              width: "100%", textAlign: "left", fontSize: 13, color: "#F87171",
              padding: "8px 12px", borderRadius: 8, border: "none", background: "none",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              fontFamily: "Barlow, sans-serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
          >
            <LogOut style={{ width: 13, height: 13 }} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { prUrl, resetState } = useReviewStore();
  const [inputUrl, setInputUrl] = useState(prUrl);
  const { submit, isPending } = usePRSubmit();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    setLocation("/app");
    submit(inputUrl);
  };

  useEffect(() => {
    if (!prUrl) setInputUrl("");
  }, [prUrl]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-4 justify-between liquid-glass-strong"
      style={{ height: 56, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-2.5 w-[240px] shrink-0">
        <LogoMark />
        <span style={{ fontFamily: "Barlow, sans-serif", fontWeight: 500, fontSize: 15, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.01em" }}>
          ReviewBot
        </span>
        <span
          className="liquid-glass"
          style={{ padding: "1px 8px", borderRadius: 9999, fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "Barlow, sans-serif" }}
        >
          AI
        </span>
      </div>

      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 480 }}>
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "rgba(255,255,255,0.30)", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Paste GitHub PR URL and press Enter..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            disabled={isPending}
            className="glass-input w-full"
            style={{ height: 36, paddingLeft: 40, paddingRight: 16, fontSize: 13 }}
          />
        </div>
      </form>

      <div className="w-[240px] shrink-0 flex justify-end items-center gap-2.5">
        <button
          className="liquid-glass"
          style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}
          onClick={() => { resetState(); setLocation("/app"); }}
        >
          <Bell style={{ width: 15, height: 15, color: "rgba(255,255,255,0.45)" }} />
        </button>
        {user && <UserMenu name={user.name} image={user.image} />}
      </div>
    </header>
  );
}
