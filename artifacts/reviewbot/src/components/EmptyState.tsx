import { useState } from "react";
import { usePRSubmit } from "@/hooks/usePRSubmit";
import { ArrowRight, Loader2 } from "lucide-react";

export default function EmptyState() {
  const [url, setUrl] = useState("");
  const { submit, isPending } = usePRSubmit();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(url);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-56px)] px-8">
      <div className="w-full max-w-xl flex flex-col items-center">
        {/* SVG illustration */}
        <svg
          width="96"
          height="96"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-6 opacity-90"
        >
          <rect
            x="10"
            y="20"
            width="100"
            height="80"
            rx="8"
            fill="#F0F7F4"
            stroke="#BBD9C8"
            strokeWidth="1.5"
          />
          <rect x="24" y="36" width="72" height="8" rx="3" fill="#BBD9C8" />
          <rect x="24" y="52" width="52" height="6" rx="3" fill="#D8EDE4" />
          <rect x="24" y="64" width="64" height="6" rx="3" fill="#D8EDE4" />
          <rect x="24" y="76" width="40" height="6" rx="3" fill="#D8EDE4" />
          <circle cx="90" cy="82" r="18" fill="#1A6B3C" />
          <path
            d="M83 82L88 87L97 76"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <h1 className="text-2xl font-semibold text-foreground mb-2 text-center">
          AI-powered code review
        </h1>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-8">
          Paste a GitHub PR URL below — ReviewBot scans for security
          vulnerabilities, bugs, and performance issues in seconds.
        </p>

        {/* Big prominent input */}
        <form onSubmit={handleSubmit} className="w-full mb-10">
          <div
            className="flex items-center gap-0 rounded-xl overflow-hidden"
            style={{
              border: "2px solid #1A6B3C",
              boxShadow: "0 2px 12px rgba(26,107,60,0.15)",
            }}
          >
            <input
              type="text"
              placeholder="https://github.com/owner/repo/pull/123"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isPending}
              autoFocus
              className="flex-1 h-12 px-4 text-[15px] focus:outline-none bg-white placeholder:text-gray-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isPending || !url.trim()}
              className="h-12 px-5 flex items-center gap-2 font-semibold text-sm text-white shrink-0 transition-opacity disabled:opacity-50"
              style={{ background: "#1A6B3C" }}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {isPending ? "Fetching…" : "Analyze PR"}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-3 gap-4 w-full">
          <FeatureCard
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke="#1A6B3C"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="#1A6B3C"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            title="Security Scanning"
            description="Detects OWASP Top 10, SQL injection, XSS, and hardcoded secrets with CWE tags."
          />
          <FeatureCard
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polyline
                  points="16 18 22 12 16 6"
                  stroke="#1A6B3C"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="8 6 2 12 8 18"
                  stroke="#1A6B3C"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="12"
                  y1="4"
                  x2="12"
                  y2="20"
                  stroke="#1A6B3C"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.4"
                />
              </svg>
            }
            title="Auto-fix Suggestions"
            description="Every issue includes corrected code you can copy with one click."
          />
          <FeatureCard
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
                  stroke="#1A6B3C"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            title="Post to GitHub"
            description="Send review comments directly to your PR with a single click."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      className="bg-white border border-border rounded-[10px] p-4 flex flex-col gap-3"
      style={{
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div className="w-9 h-9 rounded-lg bg-[#F0F7F4] flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
