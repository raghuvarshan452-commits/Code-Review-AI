import { useState, useEffect, useRef } from "react";
import { Loader2, Download, Check, Shield, Bug, Zap, Star } from "lucide-react";
import { ReviewComment, PRData } from "@workspace/api-client-react";
import { usePostComments } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

interface SummaryPanelProps {
  comments: ReviewComment[];
  prData: PRData;
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let startTime: number | null = null;
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(easeOutQuart(progress) * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

export default function SummaryPanel({ comments, prData }: SummaryPanelProps) {
  const [postDone, setPostDone] = useState(false);
  const { mutate: postComments, isPending } = usePostComments();
  const { toast } = useToast();

  const critical = comments.filter((c) => c.severity === "critical").length;
  const warning = comments.filter((c) => c.severity === "warning").length;
  const suggestion = comments.filter((c) => c.severity === "suggestion").length;
  const score = Math.max(0, 100 - critical * 20 - warning * 8 - suggestion * 2);

  const security = comments.filter((c) => c.category === "security").length;
  const bugs = comments.filter((c) => c.category === "bug").length;
  const performance = comments.filter((c) => c.category === "performance").length;
  const quality = comments.filter((c) => c.category === "code-quality" || c.category === "best-practice").length;
  const catTotal = Math.max(1, security + bugs + performance + quality);

  const displayScore = useCountUp(score);
  const scoreColor = score < 40 ? "#F87171" : score < 70 ? "#FCD34D" : "#86EFAC";
  const scoreLabel = score < 40 ? "needs attention" : score < 70 ? "moderate quality" : "good quality";

  const handlePostAll = () => {
    postComments(
      { data: { owner: prData.owner, repo: prData.repo, prNumber: prData.prNumber, comments } },
      {
        onSuccess: (res) => {
          setPostDone(true);
          toast({ title: `Posted ${res.posted} comments to GitHub` });
        },
        onError: () => {
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
    <div className="glass-card" style={{ width: 260, flexShrink: 0, padding: 20, position: "sticky", top: 88, alignSelf: "flex-start" }}>
      <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 8px" }}>
        Review Score
      </p>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 64, lineHeight: 1, color: scoreColor }}>
            {displayScore}
          </span>
          <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 20, color: "rgba(255,255,255,0.25)" }}>/100</span>
        </div>
        <p style={{ fontFamily: "Instrument Serif, serif", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.30)", margin: "4px 0 0" }}>
          {scoreLabel}
        </p>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 20, paddingTop: 20 }}>
        <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 12px" }}>
          Breakdown
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <BreakdownRow icon={<Shield style={{ width: 14, height: 14 }} />} label="Security" count={security} total={catTotal} color="#F87171" />
          <BreakdownRow icon={<Bug style={{ width: 14, height: 14 }} />} label="Bugs" count={bugs} total={catTotal} color="#FCD34D" />
          <BreakdownRow icon={<Zap style={{ width: 14, height: 14 }} />} label="Performance" count={performance} total={catTotal} color="#93C5FD" />
          <BreakdownRow icon={<Star style={{ width: 14, height: 14 }} />} label="Quality" count={quality} total={catTotal} color="#86EFAC" />
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 20, paddingTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          onClick={handlePostAll}
          disabled={isPending || postDone}
          data-testid="post-all-github"
          style={{
            width: "100%", height: 36, borderRadius: 9999, border: "none", cursor: isPending || postDone ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "Barlow, sans-serif", fontWeight: 500, fontSize: 14,
            background: postDone ? "rgba(134,239,172,0.15)" : "white", color: postDone ? "#86EFAC" : "black",
            transition: "all 0.2s ease", opacity: isPending ? 0.7 : 1,
          }}
          onMouseEnter={(e) => { if (!isPending && !postDone) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.90)"; }}
          onMouseLeave={(e) => { if (!isPending && !postDone) (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
        >
          {isPending ? (
            <><Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> Posting {comments.length}...</>
          ) : postDone ? (
            <><Check style={{ width: 14, height: 14 }} /> All Posted</>
          ) : (
            "Post All to GitHub"
          )}
        </button>
        <button
          onClick={handleExport}
          data-testid="export-report"
          className="liquid-glass"
          style={{
            width: "100%", height: 36, borderRadius: 9999, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            fontFamily: "Barlow, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.60)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "white"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.60)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.01)"; }}
        >
          <Download style={{ width: 14, height: 14 }} />
          Export Report
        </button>
      </div>
    </div>
  );
}

function BreakdownRow({ icon, label, count, total, color }: { icon: React.ReactNode; label: string; count: number; total: number; color: string }) {
  const [barWidth, setBarWidth] = useState(0);
  const pct = total > 0 ? (count / total) * 100 : 0;

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: "rgba(255,255,255,0.30)", flexShrink: 0 }}>{icon}</span>
      <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.40)", flexShrink: 0, width: 70 }}>{label}</span>
      <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 9999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${barWidth}%`, background: color, borderRadius: 9999, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.60)", flexShrink: 0, width: 16, textAlign: "right" }}>{count}</span>
    </div>
  );
}
