import { useEffect, useState } from "react";
import { useReviewStore } from "@/store/useReviewStore";
import { ExternalLink } from "lucide-react";

const STATUS_MESSAGES = [
  "Fetching PR diff...",
  "Scanning for security vulnerabilities...",
  "Detecting bugs and performance issues...",
  "Generating fix suggestions...",
  "Analyzing code quality...",
  "Finalizing review...",
];

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <div
      className="glass-card"
      style={{ padding: 24, animationDelay: `${delay}s` }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div className="skeleton-dark" style={{ width: 60, height: 24 }} />
        <div className="skeleton-dark" style={{ width: 80, height: 24 }} />
      </div>
      <div className="skeleton-dark" style={{ width: "70%", height: 18, marginBottom: 8 }} />
      <div className="skeleton-dark" style={{ width: "90%", height: 14, marginBottom: 4 }} />
      <div className="skeleton-dark" style={{ width: "60%", height: 14 }} />
    </div>
  );
}

export default function LoadingState() {
  const { prData, reviewProgress } = useReviewStore();
  const [statusIndex, setStatusIndex] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setBarWidth(85));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (reviewProgress >= 100) setBarWidth(100);
  }, [reviewProgress]);

  return (
    <div className="fade-slide-up" style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ position: "fixed", top: 56, left: 0, right: 0, height: 2, zIndex: 50 }}>
        <div style={{ height: "100%", background: "rgba(255,255,255,0.08)" }} />
        <div
          style={{
            position: "absolute", top: 0, left: 0, height: "100%",
            background: "rgba(255,255,255,0.6)",
            width: `${barWidth}%`,
            transition: barWidth === 85
              ? "width 8000ms cubic-bezier(0.1, 0.4, 0.8, 1.0)"
              : "width 300ms ease",
          }}
        />
      </div>

      {prData && (
        <div className="glass-card fade-slide-up" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h2 style={{ fontFamily: "Instrument Serif, serif", fontSize: 22, color: "white", fontWeight: 400, margin: 0, flex: 1, marginRight: 16 }}>
              {prData.title}
            </h2>
            <a
              href={`https://github.com/${prData.owner}/${prData.repo}/pull/${prData.prNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-glass"
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "4px 12px",
                borderRadius: 9999, fontSize: 12, color: "rgba(255,255,255,0.50)",
                textDecoration: "none", flexShrink: 0, fontFamily: "Barlow, sans-serif",
              }}
            >
              <ExternalLink style={{ width: 12, height: 12 }} />
              Open on GitHub
            </a>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {[
              prData.author,
              `${prData.baseBranch} → ${prData.branch}`,
              `${prData.filesChanged} files changed`,
            ].map((pill) => (
              <span key={pill} className="liquid-glass" style={{ padding: "4px 12px", borderRadius: 9999, fontSize: 12, color: "rgba(255,255,255,0.50)", fontFamily: "Barlow, sans-serif" }}>
                {pill}
              </span>
            ))}
            <span style={{ padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontFamily: "Barlow, sans-serif", background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.20)", color: "#86EFAC" }}>
              +{prData.additions}
            </span>
            <span style={{ padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontFamily: "Barlow, sans-serif", background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.20)", color: "#FCA5A5" }}>
              -{prData.deletions}
            </span>
          </div>
        </div>
      )}

      <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.40)", fontWeight: 300, textAlign: "center", marginBottom: 24 }}>
        {STATUS_MESSAGES[statusIndex]}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[0, 0.1, 0.2].map((delay, i) => (
          <SkeletonCard key={i} delay={delay} />
        ))}
      </div>
    </div>
  );
}
