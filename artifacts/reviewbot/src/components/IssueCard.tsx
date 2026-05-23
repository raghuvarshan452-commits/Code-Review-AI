import { useState } from "react";
import { Copy, Check, FileCode, Send, Loader2 } from "lucide-react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { githubGist } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { ReviewComment } from "@workspace/api-client-react";
import { usePostComments } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

interface IssueCardProps {
  comment: ReviewComment;
  owner: string;
  repo: string;
  prNumber: number;
}

const SEVERITY_STYLES: Record<string, React.CSSProperties> = {
  critical: { color: "#C0392B", background: "#FDF2F2", border: "1px solid #F5C6C6" },
  warning: { color: "#B7770D", background: "#FEF9EC", border: "1px solid #F0DFA0" },
  suggestion: { color: "#1A6B3C", background: "#F0F7F4", border: "1px solid #BBD9C8" },
};

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

export default function IssueCard({ comment, owner, repo, prNumber }: IssueCardProps) {
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
        onSuccess: () => {
          setPosted(true);
          toast({ title: "Comment posted to GitHub" });
        },
        onError: () => {
          toast({ title: "Failed to post comment", variant: "destructive" });
        },
      }
    );
  };

  const severityStyle = SEVERITY_STYLES[comment.severity] ?? SEVERITY_STYLES.suggestion;
  const lang = getLanguage(comment.file);

  return (
    <div
      className="bg-white border border-border rounded-[10px] overflow-hidden"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
      data-testid={`issue-card-${comment.id}`}
    >
      <div className="flex gap-0">
        {/* Left: Issue info */}
        <div className="flex-1 p-5 min-w-0">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide"
              style={severityStyle}
            >
              {comment.severity}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-medium text-muted-foreground border border-border bg-[#FAFAF8]">
              {CATEGORY_LABEL[comment.category] ?? comment.category}
            </span>
            {comment.cwe && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium text-[#2D5A8E] border border-[#c7d8ef] bg-[#EEF3FB]">
                {comment.cwe}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-[15px] font-semibold text-foreground mb-1.5">{comment.title}</h3>

          {/* Issue description */}
          <p className="text-[13px] text-muted-foreground mb-3 leading-relaxed">{comment.issue}</p>

          {/* File reference */}
          <div className="flex items-center gap-1.5 mb-3">
            <FileCode className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-[12px] text-muted-foreground">
              {comment.file} line {comment.line}
            </span>
          </div>

          {/* Explanation */}
          <div className="border-l-2 border-border pl-3 mb-4">
            <p className="text-[13px] text-muted-foreground leading-relaxed">{comment.explanation}</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCopyFix}
              data-testid={`copy-fix-${comment.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-white text-foreground hover:bg-[#FAFAF8] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#1A6B3C]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Fix"}
            </button>
            <button
              onClick={handlePostToGitHub}
              disabled={isPending || posted}
              data-testid={`post-github-${comment.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-white text-foreground hover:bg-[#FAFAF8] transition-colors disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : posted ? (
                <Check className="w-3.5 h-3.5 text-[#1A6B3C]" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {isPending ? "Posting..." : posted ? "Posted!" : "Post to GitHub"}
            </button>
          </div>
        </div>

        {/* Right: Fix panel */}
        <div className="w-[320px] shrink-0 border-l border-border flex flex-col" style={{ background: "#F8F7F4" }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Suggested fix</span>
            <button
              onClick={handleCopyFix}
              className="p-1 rounded hover:bg-border transition-colors"
              title="Copy fix"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#1A6B3C]" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>
          <div className="flex-1 overflow-auto text-[12px]">
            <SyntaxHighlighter
              language={lang}
              style={githubGist}
              customStyle={{
                background: "transparent",
                padding: "12px 16px",
                margin: 0,
                fontSize: "12px",
                lineHeight: "1.6",
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
