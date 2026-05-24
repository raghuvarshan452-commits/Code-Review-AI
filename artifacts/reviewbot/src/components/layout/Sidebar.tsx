import { useReviewStore } from "@/store/useReviewStore";
import { useAuth, signOut } from "@/hooks/useAuth";
import { LayoutDashboard, GitPullRequest, ShieldCheck, Settings, LogOut, Github } from "lucide-react";
import { useLocation, Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/app" },
  { icon: GitPullRequest, label: "Reviews", path: "/history" },
  { icon: ShieldCheck, label: "Security", path: "/history?filter=security" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

function NavItem({ icon: Icon, label, path, active }: { icon: React.ElementType; label: string; path: string; active: boolean }) {
  const [, setLocation] = useLocation();
  return (
    <button
      onClick={() => setLocation(path)}
      style={{
        height: 40, width: "100%", paddingLeft: 12, paddingRight: 12, borderRadius: 9999,
        display: "flex", alignItems: "center", gap: 12, border: "none", cursor: "pointer",
        fontFamily: "Barlow, sans-serif", fontWeight: 300, fontSize: 14, textAlign: "left",
        transition: "all 0.2s ease",
        background: active ? "rgba(255,255,255,0.10)" : "transparent",
        color: active ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.50)",
        outline: active ? "1px solid rgba(255,255,255,0.10)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.color = "rgba(255,255,255,0.80)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(255,255,255,0.50)";
        }
      }}
    >
      <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
      {label}
    </button>
  );
}

export default function Sidebar() {
  const { reviewHistory, loadFromHistory } = useReviewStore();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const recent = reviewHistory.slice(0, 5);

  return (
    <aside
      style={{
        position: "fixed", left: 0, top: 56, height: "calc(100vh - 56px)", width: 240,
        background: "rgba(0,0,0,0.60)", borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 12px", display: "flex", flexDirection: "column", zIndex: 40,
      }}
    >
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(({ icon, label, path }) => (
          <NavItem
            key={path}
            icon={icon}
            label={label}
            path={path}
            active={path === "/app" ? location === "/app" || location === "/" : location.startsWith(path.split("?")[0])}
          />
        ))}
      </nav>

      {recent.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <p style={{
            fontFamily: "Barlow, sans-serif", fontSize: 10, fontWeight: 400,
            color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: 8, paddingLeft: 12,
          }}>
            Recent
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {recent.map((item) => {
              const score = Math.max(0, 100 - item.comments.filter(c => c.severity === "critical").length * 20 - item.comments.filter(c => c.severity === "warning").length * 8 - item.comments.filter(c => c.severity === "suggestion").length * 2);
              return (
                <button
                  key={item.id}
                  onClick={() => { loadFromHistory(item); setLocation("/app"); }}
                  style={{
                    width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 12,
                    border: "none", background: "transparent", cursor: "pointer",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.70)", fontWeight: 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>
                      {item.repo}
                    </span>
                    <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.30)" }}>
                      #{item.prNumber} · {score}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: "auto" }}>
        {user && (
          <div style={{ marginBottom: 8, padding: "8px 12px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {user.image ? (
                <img src={user.image} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "Barlow, sans-serif" }}>
                  {user.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0, fontWeight: 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.name}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          className="liquid-glass"
          style={{
            width: "100%", height: 36, borderRadius: 9999, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "Barlow, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.40)",
            background: "rgba(255,255,255,0.03)", transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#F87171"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.40)"; }}
        >
          <LogOut style={{ width: 14, height: 14 }} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
