import { useState } from "react";
import { useReviewStore } from "@/store/useReviewStore";
import { Search, Github, History, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "critical", label: "Critical" },
  { key: "warning", label: "Warning" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
];

export default function HistoryPage() {
  const { reviewHistory, loadFromHistory } = useReviewStore();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const now = Date.now();
  const ONE_WEEK = 7 * 24 * 3600 * 1000;
  const ONE_MONTH = 30 * 24 * 3600 * 1000;

  const filtered = reviewHistory.filter((item) => {
    const matchesSearch = !search || item.repo.toLowerCase().includes(search.toLowerCase()) || item.title.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "critical") return item.comments.some(c => c.severity === "critical");
    if (activeTab === "warning") return item.comments.some(c => c.severity === "warning");
    if (activeTab === "week") return now - item.timestamp < ONE_WEEK;
    if (activeTab === "month") return now - item.timestamp < ONE_MONTH;
    return true;
  });

  return (
    <div className="fade-slide-up" style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ fontFamily: "Instrument Serif, serif", fontSize: 40, color: "white", margin: 0, fontWeight: 400 }}>
          Review <em>History</em>
        </h1>
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "rgba(255,255,255,0.30)", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input"
            style={{ width: 280, height: 36, paddingLeft: 40, paddingRight: 16, fontSize: 13 }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: "6px 16px", borderRadius: 9999, fontSize: 13,
              fontFamily: "Barlow, sans-serif", fontWeight: 300, border: "none", cursor: "pointer",
              transition: "all 0.15s ease",
              background: activeTab === key ? "rgba(255,255,255,0.10)" : "transparent",
              color: activeTab === key ? "white" : "rgba(255,255,255,0.50)",
              outline: activeTab === key ? "1px solid rgba(255,255,255,0.20)" : "1px solid transparent",
            }}
            onMouseEnter={(e) => { if (activeTab !== key) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.70)"; } }}
            onMouseLeave={(e) => { if (activeTab !== key) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.50)"; } }}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <History style={{ width: 48, height: 48, color: "rgba(255,255,255,0.15)", margin: "0 auto 16px", display: "block" }} />
          <p style={{ fontFamily: "Instrument Serif, serif", fontStyle: "italic", fontSize: 28, color: "rgba(255,255,255,0.30)", margin: "0 0 8px" }}>
            No reviews yet
          </p>
          <p style={{ fontFamily: "Barlow, sans-serif", fontWeight: 300, fontSize: 14, color: "rgba(255,255,255,0.20)", margin: 0 }}>
            Start your first review from the dashboard
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((item, i) => {
            const score = Math.max(0, 100 - item.comments.filter(c => c.severity === "critical").length * 20 - item.comments.filter(c => c.severity === "warning").length * 8 - item.comments.filter(c => c.severity === "suggestion").length * 2);
            const scoreColor = score < 40 ? "#F87171" : score < 70 ? "#FCD34D" : "#86EFAC";
            const critical = item.comments.filter(c => c.severity === "critical").length;
            const warning = item.comments.filter(c => c.severity === "warning").length;
            const suggestion = item.comments.filter(c => c.severity === "suggestion").length;
            const staggerClass = i < 5 ? `stagger-${i + 1}` : "";
            const elapsed = Date.now() - item.timestamp;
            const timeAgo = elapsed < 3600000 ? `${Math.round(elapsed / 60000)}m ago`
              : elapsed < 86400000 ? `${Math.round(elapsed / 3600000)}h ago`
              : `${Math.round(elapsed / 86400000)}d ago`;

            return (
              <div
                key={item.id}
                className={`glass-card fade-slide-up ${staggerClass}`}
                style={{
                  padding: "20px 24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                  cursor: "pointer", transition: "border-color 0.2s",
                }}
                onClick={() => { loadFromHistory(item); setLocation("/app"); }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Github style={{ width: 16, height: 16, color: "rgba(255,255,255,0.50)" }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.85)", margin: 0 }}>
                        {item.repo} <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>#{item.prNumber}</span>
                      </p>
                      <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, fontWeight: 300, color: "rgba(255,255,255,0.30)", margin: "2px 0 0" }}>
                        {item.prData.author} · {timeAgo}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {critical > 0 && <span className="severity-critical" style={{ fontSize: 11, padding: "2px 8px", borderRadius: 9999, fontFamily: "Barlow, sans-serif" }}>{critical} critical</span>}
                    {warning > 0 && <span className="severity-warning" style={{ fontSize: 11, padding: "2px 8px", borderRadius: 9999, fontFamily: "Barlow, sans-serif" }}>{warning} warnings</span>}
                    {suggestion > 0 && <span className="severity-suggestion" style={{ fontSize: 11, padding: "2px 8px", borderRadius: 9999, fontFamily: "Barlow, sans-serif" }}>{suggestion} suggestions</span>}
                    {critical === 0 && warning === 0 && suggestion === 0 && (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 9999, fontFamily: "Barlow, sans-serif", color: "rgba(255,255,255,0.25)" }}>No issues</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid ${scoreColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 14, fontWeight: 500, color: scoreColor }}>{score}</span>
                  </div>
                  <ChevronRight style={{ width: 16, height: 16, color: "rgba(255,255,255,0.25)" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
