import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route, useLocation, Router } from "wouter";
import { ReviewProvider, useReviewStore } from "@/store/useReviewStore";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import LoadingState from "@/components/LoadingState";
import PRHeader from "@/components/PRHeader";
import FilterBar from "@/components/FilterBar";
import IssueCard from "@/components/IssueCard";
import SummaryPanel from "@/components/SummaryPanel";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import HistoryPage from "@/pages/HistoryPage";
import SettingsPage from "@/pages/SettingsPage";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, RefreshCw, GitPullRequest } from "lucide-react";
import { useEffect } from "react";

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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 56px)", padding: 32 }}>
      <div className="glass-card fade-slide-up" style={{ maxWidth: 480, width: "100%", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <AlertCircle style={{ width: 20, height: 20, color: "#F87171", marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "Barlow, sans-serif", fontWeight: 500, fontSize: 15, color: "#FCA5A5", margin: "0 0 6px" }}>
              Could not load this PR
            </p>
            <p style={{ fontFamily: "Barlow, sans-serif", fontWeight: 300, fontSize: 13, color: "rgba(252,165,165,0.70)", whiteSpace: "pre-wrap", margin: 0 }}>
              {message}
            </p>
          </div>
        </div>
        <button
          onClick={resetState}
          style={{
            marginTop: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 13,
            fontFamily: "Barlow, sans-serif", fontWeight: 500, padding: "8px 16px", borderRadius: 9999,
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)", color: "#FCA5A5",
            cursor: "pointer",
          }}
        >
          <RefreshCw style={{ width: 13, height: 13 }} />
          Try a different PR
        </button>
      </div>
    </div>
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

  if (errorMessage) return <ErrorState message={errorMessage} />;

  if (!prData && !isLoading) return <DashboardPage />;

  if (isLoading) return <LoadingState />;

  if (!isLoading && reviewComments.length === 0 && prData) {
    return (
      <div className="fade-slide-up" style={{ padding: 32, maxWidth: 900 }}>
        <PRHeader prData={prData} comments={[]} />
        <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
          <GitPullRequest style={{ width: 40, height: 40, color: "rgba(255,255,255,0.15)", margin: "0 auto 16px", display: "block" }} />
          <p style={{ fontFamily: "Instrument Serif, serif", fontStyle: "italic", fontSize: 22, color: "rgba(255,255,255,0.50)", margin: "0 0 8px" }}>
            No issues found
          </p>
          <p style={{ fontFamily: "Barlow, sans-serif", fontWeight: 300, fontSize: 14, color: "rgba(255,255,255,0.30)", margin: 0 }}>
            Claude found no significant issues in this PR. Great work!
          </p>
        </div>
      </div>
    );
  }

  if (hasReview && prData) {
    return (
      <div className="fade-slide-up" style={{ padding: 32 }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", maxWidth: 1280 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <PRHeader prData={prData} comments={reviewComments} />
            <FilterBar comments={reviewComments} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredComments.length === 0 ? (
                <div className="glass-card" style={{ padding: 24, textAlign: "center" }}>
                  <p style={{ fontFamily: "Barlow, sans-serif", fontWeight: 300, fontSize: 14, color: "rgba(255,255,255,0.35)", margin: 0 }}>
                    No issues match this filter.
                  </p>
                </div>
              ) : (
                filteredComments.map((comment, i) => (
                  <IssueCard
                    key={comment.id}
                    comment={comment}
                    owner={prData.owner}
                    repo={prData.repo}
                    prNumber={prData.prNumber}
                    index={i}
                  />
                ))
              )}
            </div>
          </div>
          <SummaryPanel comments={reviewComments} prData={prData} />
        </div>
      </div>
    );
  }

  return null;
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) setLocation("/login");
  }, [loading, isAuthenticated, setLocation]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 32, height: 32, border: "2px solid rgba(255,255,255,0.10)", borderTopColor: "rgba(255,255,255,0.50)", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontFamily: "Barlow, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 300 }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <ReviewProvider>
      <div style={{ minHeight: "100vh", background: "#000" }}>
        <Navbar />
        <Sidebar />
        <main style={{ marginLeft: 240, paddingTop: 56, minHeight: "100vh", background: "#000" }}>
          {children}
        </main>
      </div>
    </ReviewProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/history">
              <AppShell><HistoryPage /></AppShell>
            </Route>
            <Route path="/settings">
              <AppShell><SettingsPage /></AppShell>
            </Route>
            <Route>
              <AppShell><ReviewDashboard /></AppShell>
            </Route>
          </Switch>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
