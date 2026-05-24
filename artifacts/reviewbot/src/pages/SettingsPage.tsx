import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Github } from "lucide-react";

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
        background: enabled ? "rgba(34,197,94,0.60)" : "rgba(255,255,255,0.10)",
        position: "relative", transition: "background 0.2s ease", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 2, width: 18, height: 18, borderRadius: "50%",
        background: "white", transition: "left 0.2s ease",
        left: enabled ? 20 : 2,
      }} />
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <p style={{
        fontFamily: "Barlow, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.60)",
        textTransform: "uppercase", letterSpacing: "0.10em", margin: "0 0 20px",
        paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [githubToken, setGithubToken] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);

  const [prefs, setPrefs] = useState({
    autoPost: false,
    emailNotifications: false,
    showSuggestions: true,
    darkCodeBlocks: true,
  });

  const togglePref = (key: keyof typeof prefs) => (value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  };

  const handleSaveToken = () => {
    setTokenSaved(true);
    setTimeout(() => setTokenSaved(false), 2000);
  };

  const initials = user?.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?";

  return (
    <div className="fade-slide-up" style={{ padding: 32, maxWidth: 680 }}>
      <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 40, color: "white", margin: "0 0 32px", fontWeight: 400 }}>
        Settings
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <SectionCard title="Profile">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {user?.image ? (
                <img src={user.image} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 20, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
                  {initials}
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 15, fontWeight: 500, color: "white", margin: 0 }}>
                {user?.name ?? "User"}
              </p>
              <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.40)", margin: "4px 0 0" }}>
                {user?.email ?? ""}
              </p>
            </div>
            <button
              className="liquid-glass"
              style={{
                padding: "6px 16px", borderRadius: 9999, fontSize: 12,
                fontFamily: "Barlow, sans-serif", color: "rgba(255,255,255,0.50)",
                border: "none", cursor: "pointer", transition: "color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.50)"; }}
            >
              Edit
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Integrations">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <Github style={{ width: 20, height: 20, color: "rgba(255,255,255,0.50)", marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.70)", margin: 0, fontWeight: 400 }}>
                  GitHub Token
                </p>
                <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.30)", margin: "2px 0 0", fontWeight: 300 }}>
                  Used to post review comments
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="glass-input"
                style={{ width: 220, height: 36, paddingLeft: 16, paddingRight: 16, fontSize: 13 }}
              />
              <button
                onClick={handleSaveToken}
                className="liquid-glass"
                style={{
                  padding: "6px 16px", borderRadius: 9999, fontSize: 12, height: 36,
                  fontFamily: "Barlow, sans-serif", color: tokenSaved ? "#86EFAC" : "rgba(255,255,255,0.50)",
                  border: "none", cursor: "pointer", whiteSpace: "nowrap", transition: "color 0.2s",
                }}
              >
                {tokenSaved ? "Saved ✓" : "Save"}
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Preferences">
          {[
            { key: "autoPost" as const, label: "Auto-post to GitHub", desc: "Automatically post review comments to PRs" },
            { key: "emailNotifications" as const, label: "Email notifications", desc: "Get notified when reviews complete" },
            { key: "showSuggestions" as const, label: "Show suggestions", desc: "Include code style suggestions in reviews" },
            { key: "darkCodeBlocks" as const, label: "Dark code blocks", desc: "Use dark theme for code fix panels" },
          ].map(({ key, label, desc }, i, arr) => (
            <div
              key={key}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
            >
              <div>
                <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.70)", margin: 0, fontWeight: 400 }}>
                  {label}
                </p>
                <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.30)", margin: "2px 0 0", fontWeight: 300 }}>
                  {desc}
                </p>
              </div>
              <Toggle enabled={prefs[key]} onChange={togglePref(key)} />
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  );
}
