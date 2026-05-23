import { PRData, ReviewComment } from "@workspace/api-client-react";

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
    <div
      className="bg-white border border-border rounded-[10px] p-5 mb-4"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      <h2 className="text-[20px] font-semibold text-foreground mb-3 leading-snug">
        {prData.title}
      </h2>

      {/* Meta pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground bg-muted border border-border">
          <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">
            {prData.author.slice(0, 2).toUpperCase()}
          </span>
          {prData.author}
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground bg-muted border border-border">
          {prData.baseBranch} → {prData.branch}
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground bg-muted border border-border">
          {prData.filesChanged} files changed
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium text-green-700 bg-green-50 border border-green-200">
          +{prData.additions}
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium text-red-700 bg-red-50 border border-red-200">
          -{prData.deletions}
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Issues Found">
          <span className="text-2xl font-bold text-foreground">{comments.length}</span>
          <div className="flex gap-2 mt-1.5 flex-wrap">
            {critical > 0 && (
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ color: '#C0392B', background: '#FDF2F2', border: '1px solid #F5C6C6' }}>
                {critical} critical
              </span>
            )}
            {warning > 0 && (
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ color: '#B7770D', background: '#FEF9EC', border: '1px solid #F0DFA0' }}>
                {warning} warning
              </span>
            )}
            {suggestion > 0 && (
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ color: '#1A6B3C', background: '#F0F7F4', border: '1px solid #BBD9C8' }}>
                {suggestion} suggestion
              </span>
            )}
          </div>
        </StatCard>

        <StatCard label="Files Reviewed">
          <span className="text-2xl font-bold text-foreground">{prData.filesChanged}</span>
          <p className="text-xs text-muted-foreground mt-1.5">across this PR</p>
        </StatCard>

        <StatCard label="Lines Analyzed">
          <span className="text-2xl font-bold text-foreground">{linesAnalyzed.toLocaleString()}</span>
          <p className="text-xs text-muted-foreground mt-1.5">additions + deletions</p>
        </StatCard>
      </div>
    </div>
  );
}

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#FAFAF8] border border-border rounded-lg p-4">
      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">{label}</p>
      {children}
    </div>
  );
}
