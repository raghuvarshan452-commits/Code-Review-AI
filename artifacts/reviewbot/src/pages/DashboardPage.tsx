import { useState } from "react";
import { usePRSubmit } from "@/hooks/usePRSubmit";
import { useReviewStore } from "@/store/useReviewStore";
import { Search, GitPullRequest, ShieldAlert, Zap, Clock, ChevronRight, Github } from "lucide-react";
import { useLocation } from "wouter";

const EXAMPLE_PRS = [
  { label: "expressjs/express #3390", url: "https://github.com/expressjs/express/pull/3390" },
  { label: "facebook/react #31816", url: "https://github.com/facebook/react/pull/31816" },
];

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const { submit, isPending } = usePRSubmit();
  const { reviewHistory, loadFromHistory } = useReviewStore();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    submit(url);
  };

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
    submit(exampleUrl);
  };

  const totalCritical = reviewHistory.reduce((sum, h) => sum + h.comments.filter(c => c.severity === "critical").length, 0);

  const stats = [
    { icon: GitPullRequest, value: reviewHistory.length, label: "Total Reviews" },
    { icon: ShieldAlert, value: totalCritical, label: "Critical Issues" },
    { icon: Zap, value: "94%", label: "Detection Rate" },
    { icon: Clock, value: "58s", label: "Avg Review Time" },
  ];

  return (
    <div className="fade-slide-up" style={{ padding: 32, maxWidth: 1100 }}>
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <h1 style={{ fontFamily: "Instrument Serif, serif", fontStyle: "italic", fontSize: "clamp(32px, 5vw, 56px)", color: "white", lineHeight: 1.15, margin: "0 0 24px" }}>
          What would you like to
          <br />
          review{" "}
          <span style={{ color: "rgba(255,255,255,0.40)" }}>today?</span>
        </h1>

        <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto 16px" }}>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", width: 20, height: 20, color: "rgba(255,255,255,0.30)", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Paste any GitHub PR URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isPending}
              autoFocus
              className="glass-input w-full"
              style={{ height: 52, paddingLeft: 52, paddingRight: 20, fontSize: 15 }}
            />
          </div>
        </form>

        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {EXAMPLE_PRS.map((ex) => (
            <button
              key={ex.url}
              onClick={() => handleExampleClick(ex.url)}
              className="liquid-glass"
              style={{
                padding: "6px 16px", borderRadius: 9999, fontSize: 12, fontFamily: "Barlow, sans-serif",
                color: "rgba(255,255,255,0.40)", border: "none", cursor: "pointer",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.40)"; }}
            >
              ↗ {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {stats.map(({ icon: Icon, value, label }, i) => (
          <div
            key={label}
            className={`glass-card fade-slide-up stagger-${i + 1}`}
            style={{ padding: 20 }}
          >
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon style={{ width: 18, height: 18, color: "rgba(255,255,255,0.50)" }} />
            </div>
            <div style={{ fontFamily: "Instrument Serif, serif", fontSize: 32, color: "white", marginTop: 12 }}>
              {value}
            </div>
            <div style={{ fontFamily: "Barlow, sans-serif", fontWeight: 300, fontSize: 12, color: "rgba(255,255,255,0.40)", marginTop: 4, letterSpacing: "0.02em" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "Instrument Serif, serif", fontSize: 22, color: "white", margin: 0 }}>
            Recent Reviews
          </h2>
          <button
            onClick={() => setLocation("/history")}
            className="liquid-glass"
            style={{
              padding: "6px 16px", borderRadius: 9999, fontSize: 12, fontFamily: "Barlow, sans-serif",
              color: "rgba(255,255,255,0.50)", border: "none", cursor: "pointer", transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.50)"; }}
          >
            View all →
          </button>
        </div>

        {reviewHistory.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <GitPullRequest style={{ width: 48, height: 48, color: "rgba(255,255,255,0.15)", margin: "0 auto 16px", display: "block" }} />
            <p style={{ fontFamily: "Instrument Serif, serif", fontStyle: "italic", fontSize: 24, color: "rgba(255,255,255,0.30)", margin: "0 0 8px" }}>
              No reviews yet
            </p>
            <p style={{ fontFamily: "Barlow, sans-serif", fontWeight: 300, fontSize: 14, color: "rgba(255,255,255,0.25)", margin: 0 }}>
              Paste a GitHub PR URL above to get started
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reviewHistory.slice(0, 6).map((item, i) => {
              const score = Math.max(0, 100 - item.comments.filter(c => c.severity === "critical").length * 20 - item.comments.filter(c => c.severity === "warning").length * 8 - item.comments.filter(c => c.severity === "suggestion").length * 2);
              const scoreColor = score < 40 ? "#F87171" : score < 70 ? "#FCD34D" : "#86EFAC";
              const critical = item.comments.filter(c => c.severity === "critical").length;
              const warning = item.comments.filter(c => c.severity === "warning").length;
              const suggestion = item.comments.filter(c => c.severity === "suggestion").length;
              const staggerClass = i < 5 ? `stagger-${i + 1}` : "";
              return (
                <div
                  key={item.id}
                  className={`glass-card fade-slide-up ${staggerClass}`}
                  style={{
                    padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", transition: "border-color 0.2s",
                  }}
                  onClick={() => { loadFromHistory(item); }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Github style={{ width: 18, height: 18, color: "rgba(255,255,255,0.50)" }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.90)", margin: 0 }}>
                        {item.repo} <span style={{ color: "rgba(255,255,255,0.40)", fontWeight: 300 }}>#{item.prNumber}</span>
                      </p>
                      <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, fontWeight: 300, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>
                        {Math.round((Date.now() - item.timestamp) / 3600000) < 24
                          ? `${Math.round((Date.now() - item.timestamp) / 3600000)} hours ago`
                          : `${Math.round((Date.now() - item.timestamp) / 86400000)} days ago`}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "center", flexWrap: "wrap" }}>
                    {critical > 0 && <span className="severity-critical" style={{ fontSize: 11, padding: "2px 8px", borderRadius: 9999, fontFamily: "Barlow, sans-serif" }}>{critical} critical</span>}
                    {warning > 0 && <span className="severity-warning" style={{ fontSize: 11, padding: "2px 8px", borderRadius: 9999, fontFamily: "Barlow, sans-serif" }}>{warning} warnings</span>}
                    {suggestion > 0 && <span className="severity-suggestion" style={{ fontSize: 11, padding: "2px 8px", borderRadius: 9999, fontFamily: "Barlow, sans-serif" }}>{suggestion} suggestions</span>}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      border: `2px solid ${scoreColor}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, fontWeight: 500, color: scoreColor }}>{score}</span>
                    </div>
                    <ChevronRight style={{ width: 16, height: 16, color: "rgba(255,255,255,0.25)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
