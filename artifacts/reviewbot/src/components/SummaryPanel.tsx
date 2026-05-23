import { useState } from "react";
import { Loader2, Download } from "lucide-react";
import { ReviewComment, PRData } from "@workspace/api-client-react";
import { usePostComments } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

interface SummaryPanelProps {
  comments: ReviewComment[];
  prData: PRData;
}

export default function SummaryPanel({ comments, prData }: SummaryPanelProps) {
  const [postingCount, setPostingCount] = useState<number | null>(null);
  const { mutate: postComments, isPending } = usePostComments();
  const { toast } = useToast();

  const critical = comments.filter((c) => c.severity === "critical").length;
  const warning = comments.filter((c) => c.severity === "warning").length;
  const suggestion = comments.filter((c) => c.severity === "suggestion").length;

  const score = Math.max(0, 100 - critical * 20 - warning * 8 - suggestion * 2);

  const scoreColor = score < 40 ? "#C0392B" : score < 70 ? "#B7770D" : "#1A6B3C";
  const scoreTrackColor = score < 40 ? "#FDF2F2" : score < 70 ? "#FEF9EC" : "#F0F7F4";

  const security = comments.filter((c) => c.category === "security").length;
  const bugs = comments.filter((c) => c.category === "bug").length;
  const performance = comments.filter((c) => c.category === "performance").length;
  const quality = comments.filter((c) => c.category === "code-quality" || c.category === "best-practice").length;
  const catTotal = Math.max(1, security + bugs + performance + quality);

  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const handlePostAll = () => {
    setPostingCount(0);
    postComments(
      { data: { owner: prData.owner, repo: prData.repo, prNumber: prData.prNumber, comments } },
      {
        onSuccess: (res) => {
          setPostingCount(null);
          toast({ title: `Posted ${res.posted} comments to GitHub` });
        },
        onError: () => {
          setPostingCount(null);
          toast({ title: "Failed to post comments", variant: "destructive" });
        },
      }
    );
  };

  const handleExport = () => {
    const lines = [
      `# ReviewBot AI Report`,
      `## PR: ${prData.title}`,
      `**Repository:** ${prData.owner}/${prData.repo} #${prData.prNumber}`,
      `**Author:** ${prData.author}`,
      `**Score:** ${score}/100`,
      ``,
      `## Summary`,
      `- Critical: ${critical}`,
      `- Warning: ${warning}`,
      `- Suggestion: ${suggestion}`,
      ``,
      `## Issues`,
      ...comments.map((c, i) => [
        `### ${i + 1}. [${c.severity.toUpperCase()}] ${c.title}`,
        `**File:** ${c.file} (line ${c.line})`,
        `**Category:** ${c.category}`,
        c.cwe ? `**CWE:** ${c.cwe}` : "",
        ``,
        c.issue,
        ``,
        `**Explanation:** ${c.explanation}`,
        ``,
        `**Fix:**`,
        "```",
        c.fix,
        "```",
        "",
      ].filter(Boolean).join("\n")),
    ].join("\n");

    const blob = new Blob([lines], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reviewbot-${prData.repo}-pr${prData.prNumber}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="w-[280px] shrink-0 bg-white border border-border rounded-[10px] p-5 sticky top-4 self-start"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      {/* Score */}
      <div className="flex flex-col items-center mb-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Review Score</p>
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
            <circle cx="44" cy="44" r="36" fill={scoreTrackColor} stroke={scoreTrackColor} strokeWidth="8" />
            <circle
              cx="44" cy="44" r="36"
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: scoreColor }}>{score}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>
      </div>

      {/* Severity breakdown */}
      <div className="space-y-2 mb-5">
        {critical > 0 && (
          <SeverityRow label="Critical" count={critical} color="#C0392B" bg="#FDF2F2" />
        )}
        {warning > 0 && (
          <SeverityRow label="Warning" count={warning} color="#B7770D" bg="#FEF9EC" />
        )}
        {suggestion > 0 && (
          <SeverityRow label="Suggestion" count={suggestion} color="#1A6B3C" bg="#F0F7F4" />
        )}
      </div>

      {/* Category breakdown */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">By Category</p>
      <div className="space-y-2 mb-5">
        <CategoryBar label="Security" count={security} total={catTotal} color="#C0392B" />
        <CategoryBar label="Bugs" count={bugs} total={catTotal} color="#B7770D" />
        <CategoryBar label="Performance" count={performance} total={catTotal} color="#2D5A8E" />
        <CategoryBar label="Quality" count={quality} total={catTotal} color="#1A6B3C" />
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={handlePostAll}
          disabled={isPending}
          data-testid="post-all-github"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white bg-[#1A6B3C] hover:bg-[#155a32] transition-colors disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {postingCount !== null ? `Posting ${comments.length}...` : "Posting..."}
            </>
          ) : (
            "Post All to GitHub"
          )}
        </button>
        <button
          onClick={handleExport}
          data-testid="export-report"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-foreground border border-border bg-white hover:bg-[#FAFAF8] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>
    </div>
  );
}

function SeverityRow({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ color, background: bg }}>
        {count}
      </span>
    </div>
  );
}

function CategoryBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{count}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
