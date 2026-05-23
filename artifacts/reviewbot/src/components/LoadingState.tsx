import { useEffect, useState } from "react";
import { useReviewStore } from "@/store/useReviewStore";

const STATUS_MESSAGES = [
  (n: number) => `Analyzing ${n} files...`,
  () => "Detecting security vulnerabilities...",
  () => "Checking performance patterns...",
  () => "Reviewing code quality...",
  () => "Identifying bug patterns...",
  () => "Finalizing review...",
];

export default function LoadingState() {
  const { prData, reviewProgress } = useReviewStore();
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fileCount = prData?.filesChanged ?? 0;
  const statusMsg = STATUS_MESSAGES[statusIndex](fileCount);

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">{statusMsg}</span>
          <span>{Math.round(reviewProgress)}%</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${reviewProgress}%` }}
          />
        </div>
      </div>

      {/* PR Header skeleton or real data */}
      {prData && (
        <div className="bg-white border border-border rounded-[10px] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 className="text-[20px] font-semibold text-foreground mb-3">{prData.title}</h2>
          <div className="flex flex-wrap gap-2">
            <MetaPill>{prData.author}</MetaPill>
            <MetaPill>{prData.baseBranch} → {prData.branch}</MetaPill>
            <MetaPill>{prData.filesChanged} files changed</MetaPill>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium text-green-700 bg-green-50 border border-green-200">+{prData.additions}</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium text-red-700 bg-red-50 border border-red-200">-{prData.deletions}</span>
          </div>
        </div>
      )}

      {/* Skeleton cards */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} delay={i * 0.1} />
        ))}
      </div>
    </div>
  );
}

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground bg-muted border border-border">
      {children}
    </span>
  );
}

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <div
      className="bg-white border border-border rounded-[10px] p-5 animate-pulse"
      style={{ animationDelay: `${delay}s`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 rounded-full bg-muted" />
        <div className="h-5 w-20 rounded-full bg-muted" />
      </div>
      <div className="h-4 w-2/3 rounded bg-muted mb-2" />
      <div className="h-3 w-full rounded bg-muted mb-1.5" />
      <div className="h-3 w-4/5 rounded bg-muted" />
    </div>
  );
}
