import { PRData, ReviewComment } from "@workspace/api-client-react";
import { ExternalLink, GitPullRequest, FileText, Code2 } from "lucide-react";

interface PRHeaderProps {
  prData: PRData;
  comments: ReviewComment[];
}

export default function PRHeader({ prData, comments }: PRHeaderProps) {
  const critical = comments.filter((c) => c.severity === "critical").length;
  const warning = comments.filter((c) => c.severity === "warning").length;
  const suggestion = comments.filter((c) => c.severity === "suggestion").length;
  const linesAnalyzed = prData.files.reduce((sum, f) => sum + f.additions + f.deletions, 0);

  return (
    <div className="glass-card fade-slide-up" style={{ padding: 24, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h2 style={{ fontFamily: "Instrument Serif, serif", fontSize: 22, color: "white", fontWeight: 400, margin: 0, flex: 1, marginRight: 16, lineHeight: 1.3 }}>
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
        <span className="liquid-glass" style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 9999, fontSize: 12, color: "rgba(255,255,255,0.50)", fontFamily: "Barlow, sans-serif" }}>
          {prData.author}
        </span>
        <span className="liquid-glass" style={{ padding: "4px 12px", borderRadius: 9999, fontSize: 12, color: "rgba(255,255,255,0.50)", fontFamily: "Barlow, sans-serif" }}>
          {prData.baseBranch} → {prData.branch}
        </span>
        <span className="liquid-glass" style={{ padding: "4px 12px", borderRadius: 9999, fontSize: 12, color: "rgba(255,255,255,0.50)", fontFamily: "Barlow, sans-serif" }}>
          {prData.filesChanged} files changed
        </span>
        <span style={{ padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontFamily: "Barlow, sans-serif", background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.20)", color: "#86EFAC" }}>
          +{prData.additions}
        </span>
        <span style={{ padding: "4px 12px", borderRadius: 9999, fontSize: 12, fontFamily: "Barlow, sans-serif", background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.20)", color: "#FCA5A5" }}>
          -{prData.deletions}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20 }}>
        <StatCard label="Issues Found" icon={<GitPullRequest style={{ width: 14, height: 14 }} />}>
          <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 28, color: "white" }}>{comments.length}</span>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {critical > 0 && <span className="severity-critical" style={{ fontSize: 11, padding: "1px 8px", borderRadius: 9999 }}>{critical} critical</span>}
            {warning > 0 && <span className="severity-warning" style={{ fontSize: 11, padding: "1px 8px", borderRadius: 9999 }}>{warning} warning</span>}
            {suggestion > 0 && <span className="severity-suggestion" style={{ fontSize: 11, padding: "1px 8px", borderRadius: 9999 }}>{suggestion} suggestion</span>}
          </div>
        </StatCard>
        <StatCard label="Files Reviewed" icon={<FileText style={{ width: 14, height: 14 }} />}>
          <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 28, color: "white" }}>{prData.filesChanged}</span>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", marginTop: 8, fontFamily: "Barlow, sans-serif" }}>across this PR</p>
        </StatCard>
        <StatCard label="Lines Analyzed" icon={<Code2 style={{ width: 14, height: 14 }} />}>
          <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 28, color: "white" }}>{linesAnalyzed.toLocaleString()}</span>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.30)", marginTop: 8, fontFamily: "Barlow, sans-serif" }}>additions + deletions</p>
        </StatCard>
      </div>
    </div>
  );
}

function StatCard({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ color: "rgba(255,255,255,0.30)" }}>{icon}</span>
        <p style={{ fontSize: 10, fontFamily: "Barlow, sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.30)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}
