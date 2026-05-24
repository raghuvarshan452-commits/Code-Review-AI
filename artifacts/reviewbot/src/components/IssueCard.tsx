import { useState } from "react";
import { Copy, Check, FileCode, Send, Loader2, Github } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { ReviewComment } from "@workspace/api-client-react";
import { usePostComments } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

interface IssueCardProps {
  comment: ReviewComment;
  owner: string;
  repo: string;
  prNumber: number;
  index?: number;
}

const CATEGORY_LABEL: Record<string, string> = {
  security: "Security",
  bug: "Bug",
  performance: "Performance",
  "code-quality": "Code Quality",
  "best-practice": "Best Practice",
};

function getLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    js: "javascript", jsx: "javascript",
    ts: "typescript", tsx: "typescript",
    py: "python", go: "go", java: "java",
    rb: "ruby", php: "php", cs: "csharp",
    cpp: "cpp", c: "c", rs: "rust",
    sh: "bash", yml: "yaml", yaml: "yaml",
    json: "json", html: "html", css: "css",
  };
  return map[ext] ?? "text";
}

export default function IssueCard({ comment, owner, repo, prNumber, index = 0 }: IssueCardProps) {
  const [copied, setCopied] = useState(false);
  const [posted, setPosted] = useState(false);
  const { toast } = useToast();
  const { mutate: postComments, isPending } = usePostComments();

  const handleCopyFix = async () => {
    await navigator.clipboard.writeText(comment.fix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostToGitHub = () => {
    postComments(
      { data: { owner, repo, prNumber, comments: [comment] } },
      {
        onSuccess: () => { setPosted(true); toast({ title: "Comment posted to GitHub" }); },
        onError: () => { toast({ title: "Failed to post comment", variant: "destructive" }); },
      }
    );
  };

  const lang = getLanguage(comment.file);
  const staggerClass = index < 5 ? `stagger-${index + 1}` : "";
  const staggerStyle = index >= 5 ? { animationDelay: `${index * 0.06}s`, opacity: 0 } : {};

  return (
    <div
      className={`glass-card fade-slide-up ${staggerClass}`}
      style={{ overflow: "hidden", transition: "border-color 0.2s", ...staggerStyle }}
      data-testid={`issue-card-${comment.id}`}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
    >
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1, padding: "20px 24px", minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span
              className={`severity-${comment.severity}`}
              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 9999, fontFamily: "Barlow, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}
            >
              {comment.severity}
            </span>
            <span
              className="category-badge"
              style={{ fontSize: 11, padding: "4px 10px", borderRadius: 9999, fontFamily: "Barlow, sans-serif" }}
            >
              {CATEGORY_LABEL[comment.category] ?? comment.category}
            </span>
            {comment.cwe && (
              <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 9999, fontFamily: "Barlow, sans-serif", background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.20)", color: "#93C5FD" }}>
                {comment.cwe}
              </span>
            )}
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.90)", fontFamily: "Barlow, sans-serif", lineHeight: 1.4, margin: "0 0 6px" }}>
            {comment.title}
          </h3>

          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", fontFamily: "Barlow, sans-serif", fontWeight: 300, lineHeight: 1.6, margin: "0 0 8px" }}>
            {comment.issue}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
            <FileCode style={{ width: 12, height: 12, color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.30)" }}>
              {comment.file} line {comment.line}
            </span>
          </div>

          <div style={{ borderLeft: "2px solid rgba(255,255,255,0.08)", paddingLeft: 12, marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", fontFamily: "Barlow, sans-serif", fontWeight: 300, lineHeight: 1.6, fontStyle: "italic", margin: 0 }}>
              {comment.explanation}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleCopyFix}
              data-testid={`copy-fix-${comment.id}`}
              className="liquid-glass"
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                borderRadius: 9999, fontSize: 12, fontFamily: "Barlow, sans-serif", fontWeight: 500,
                color: copied ? "#86EFAC" : "rgba(255,255,255,0.50)", border: "none", cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = copied ? "#86EFAC" : "rgba(255,255,255,0.50)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.01)"; }}
            >
              {copied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
              {copied ? "Copied!" : "Copy Fix"}
            </button>
            <button
              onClick={handlePostToGitHub}
              disabled={isPending || posted}
              data-testid={`post-github-${comment.id}`}
              className="liquid-glass"
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                borderRadius: 9999, fontSize: 12, fontFamily: "Barlow, sans-serif", fontWeight: 500,
                color: posted ? "#86EFAC" : "rgba(255,255,255,0.50)", border: "none", cursor: isPending || posted ? "not-allowed" : "pointer",
                opacity: isPending ? 0.6 : 1, transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { if (!isPending && !posted) { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.01)"; e.currentTarget.style.color = posted ? "#86EFAC" : "rgba(255,255,255,0.50)"; }}
            >
              {isPending ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> : posted ? <Check style={{ width: 12, height: 12 }} /> : <Github style={{ width: 12, height: 12 }} />}
              {isPending ? "Posting..." : posted ? "Posted ✓" : "Post to GitHub"}
            </button>
          </div>
        </div>

        <div style={{ width: 300, flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily: "Barlow, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.30)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Suggested fix
            </span>
            <button
              onClick={handleCopyFix}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
              title="Copy fix"
            >
              {copied
                ? <Check style={{ width: 14, height: 14, color: "#86EFAC" }} />
                : <Copy style={{ width: 14, height: 14, color: "rgba(255,255,255,0.20)" }} />
              }
            </button>
          </div>
          <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
            <span style={{ position: "absolute", top: 10, right: 12, fontSize: 10, color: "rgba(255,255,255,0.20)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Barlow, sans-serif", zIndex: 1 }}>
              {lang}
            </span>
            <SyntaxHighlighter
              language={lang}
              style={vs2015}
              customStyle={{
                background: "rgba(0,0,0,0.6)",
                border: "none",
                padding: "14px 16px",
                margin: 0,
                fontSize: "12px",
                lineHeight: "1.6",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                color: "rgba(255,255,255,0.75)",
              }}
              wrapLongLines
            >
              {comment.fix}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
}
