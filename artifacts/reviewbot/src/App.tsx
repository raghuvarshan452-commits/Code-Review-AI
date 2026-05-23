import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
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

function ReviewDashboard() {
  const {
    prData,
    reviewComments,
    isLoadingPR,
    isReviewRunning,
    activeFilter,
  } = useReviewStore();

  const isLoading = isLoadingPR || isReviewRunning;
  const hasReview = !isLoading && reviewComments.length > 0 && prData;
  const hasEmptyReview = !isLoading && reviewComments.length === 0 && prData;

  const filteredComments = getFilteredComments(reviewComments, activeFilter);

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

  if (hasEmptyReview && prData) {
    return (
      <div className="pl-[280px] pt-14">
        <div className="p-6 max-w-5xl">
          <PRHeader prData={prData} comments={[]} />
          <div className="bg-white border border-border rounded-[10px] p-10 text-center" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p className="text-lg font-semibold text-foreground mb-2">No issues found</p>
            <p className="text-sm text-muted-foreground">Claude found no significant issues in this PR. Great work!</p>
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
            {/* Main content */}
            <div className="flex-1 min-w-0">
              <PRHeader prData={prData} comments={reviewComments} />
              <FilterBar comments={reviewComments} />
              <div className="space-y-3">
                {filteredComments.length === 0 ? (
                  <div className="bg-white border border-border rounded-[10px] p-6 text-center text-sm text-muted-foreground" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
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
            {/* Summary panel */}
            <SummaryPanel comments={reviewComments} prData={prData} />
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ReviewProvider>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Sidebar />
            <ReviewDashboard />
          </div>
          <Toaster />
        </ReviewProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
