import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReviewProvider, useReviewStore } from "@/store/useReviewStore";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import PRHeader from "@/components/PRHeader";
import FilterBar from "@/components/FilterBar";
import IssueCard from "@/components/IssueCard";
import SummaryPanel from "@/components/SummaryPanel";
import LoginPage from "@/pages/LoginPage";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, RefreshCw } from "lucide-react";

const queryClient = new QueryClient();

function getFilteredComments(
  comments: ReturnType<typeof useReviewStore>["reviewComments"],
  activeFilter: string
) {
  if (activeFilter === "all") return comments;
  if (["critical", "warning", "suggestion"].includes(activeFilter)) {
    return comments.filter((c) => c.severity === activeFilter);
  }
  const catMap: Record<string, string> = {
    security: "security",
    bug: "bug",
    performance: "performance",
  };
  if (catMap[activeFilter]) {
    return comments.filter((c) => c.category === catMap[activeFilter]);
  }
  return comments;
}

function ErrorState({ message }: { message: string }) {
  const { resetState } = useReviewStore();
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-8">
      <div className="w-full max-w-lg">
        <div
          className="rounded-xl p-6 flex flex-col gap-4"
          style={{ background: "#FFF5F5", border: "1.5px solid #FCA5A5" }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "#DC2626" }} />
            <div className="flex-1">
              <p className="font-semibold text-[15px] mb-1" style={{ color: "#991B1B" }}>
                Could not load this PR
              </p>
              <p className="text-sm whitespace-pre-wrap" style={{ color: "#7F1D1D" }}>
                {message}
              </p>
            </div>
          </div>
          <button
            onClick={resetState}
            className="self-start flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ background: "#DC2626", color: "white" }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try a different PR
          </button>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-white border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Try a public PR
          </p>
          <div className="space-y-1.5">
            {[
              "https://github.com/facebook/react/pull/31816",
              "https://github.com/microsoft/vscode/pull/235000",
              "https://github.com/axios/axios/pull/6700",
            ].map((url) => (
              <ExampleLink key={url} url={url} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExampleLink({ url }: { url: string }) {
  const { resetState } = useReviewStore();
  const short = url.replace("https://github.com/", "");

  const handleClick = () => {
    resetState();
    navigator.clipboard.writeText(url).catch(() => {});
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-muted transition-colors font-mono"
      style={{ color: "#1A6B3C" }}
      title="Click to copy URL"
    >
      {short}
    </button>
  );
}

function ReviewDashboard() {
  const {
    prData,
    reviewComments,
    isLoadingPR,
    isReviewRunning,
    activeFilter,
    errorMessage,
  } = useReviewStore();

  const isLoading = isLoadingPR || isReviewRunning;
  const hasReview = !isLoading && reviewComments.length > 0 && prData;

  const filteredComments = getFilteredComments(reviewComments, activeFilter);

  if (errorMessage) {
    return (
      <div className="pl-[280px] pt-14">
        <ErrorState message={errorMessage} />
      </div>
    );
  }

  if (!prData && !isLoading) {
    return <EmptyState />;
  }

  if (isLoading) {
    return (
      <div className="pl-[280px] pt-14">
        <div className="p-6">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (!isLoading && reviewComments.length === 0 && prData) {
    return (
      <div className="pl-[280px] pt-14">
        <div className="p-6 max-w-5xl">
          <PRHeader prData={prData} comments={[]} />
          <div
            className="bg-white border border-border rounded-[10px] p-10 text-center"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <p className="text-lg font-semibold text-foreground mb-2">No issues found</p>
            <p className="text-sm text-muted-foreground">
              Claude found no significant issues in this PR. Great work!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasReview && prData) {
    return (
      <div className="pl-[280px] pt-14">
        <div className="p-6">
          <div className="flex gap-5 items-start max-w-[1280px]">
            <div className="flex-1 min-w-0">
              <PRHeader prData={prData} comments={reviewComments} />
              <FilterBar comments={reviewComments} />
              <div className="space-y-3">
                {filteredComments.length === 0 ? (
                  <div
                    className="bg-white border border-border rounded-[10px] p-6 text-center text-sm text-muted-foreground"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                  >
                    No issues match this filter.
                  </div>
                ) : (
                  filteredComments.map((comment) => (
                    <IssueCard
                      key={comment.id}
                      comment={comment}
                      owner={prData.owner}
                      repo={prData.repo}
                      prNumber={prData.prNumber}
                    />
                  ))
                )}
              </div>
            </div>
            <SummaryPanel comments={reviewComments} prData={prData} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#FAFAF8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid #E5E7EB",
              borderTopColor: "#1A6B3C",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: 14, color: "#78716C" }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthGate>
          <ReviewProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              <Sidebar />
              <ReviewDashboard />
            </div>
          </ReviewProvider>
        </AuthGate>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
