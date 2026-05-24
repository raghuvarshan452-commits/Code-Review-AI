import { useFetchPR } from "@workspace/api-client-react";
import { useReviewStore } from "@/store/useReviewStore";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

const REVIEW_TIMEOUT_MS = 180_000;

export function usePRSubmit() {
  const store = useReviewStore();
  const { mutate: fetchPR, isPending } = useFetchPR();
  const { toast } = useToast();
  const storeRef = useRef(store);
  storeRef.current = store;

  const startReview = async (prData: Parameters<typeof store.setPrData>[0]) => {
    if (!prData) return;
    const s = storeRef.current;
    s.setIsReviewRunning(true);
    s.setReviewProgress(0);
    s.setErrorMessage(null);

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress = Math.min(90, currentProgress + 1.5);
      storeRef.current.setReviewProgress(Math.round(currentProgress));
    }, 300);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REVIEW_TIMEOUT_MS);

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: prData.files }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error ${response.status}: ${response.statusText}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
      }

      const trimmed = buffer.trim();
      if (!trimmed) {
        storeRef.current.setReviewComments([]);
        storeRef.current.setReviewProgress(100);
        return;
      }

      const cleaned = trimmed.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      let comments;
      try {
        comments = JSON.parse(cleaned);
      } catch {
        throw new Error("AI returned unexpected output — please try again.");
      }

      if (!Array.isArray(comments)) {
        throw new Error("AI returned unexpected output — please try again.");
      }

      storeRef.current.setReviewComments(comments);
      storeRef.current.setReviewProgress(100);
      setTimeout(() => storeRef.current.saveToHistory(), 100);

      const criticalCount = Array.isArray(comments)
        ? comments.filter((c: { severity: string }) => c.severity === "critical").length
        : 0;
      const warningCount = Array.isArray(comments)
        ? comments.filter((c: { severity: string }) => c.severity === "warning").length
        : 0;
      const suggestionCount = Array.isArray(comments)
        ? comments.filter((c: { severity: string }) => c.severity === "suggestion").length
        : 0;
      const score = Math.max(0, 100 - criticalCount * 20 - warningCount * 8 - suggestionCount * 2);

      const scoreLabel = score >= 70 ? "Good quality" : score >= 40 ? "Moderate quality" : "Needs attention";
      const issuesSummary = [
        criticalCount > 0 ? `${criticalCount} critical` : "",
        warningCount > 0 ? `${warningCount} warnings` : "",
        suggestionCount > 0 ? `${suggestionCount} suggestions` : "",
      ].filter(Boolean).join(" · ") || "No issues found";

      toast({
        title: `Review complete — ${score}/100`,
        description: `${scoreLabel} · ${issuesSummary}`,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof Error && err.name === "AbortError";
      const msg = isAbort
        ? "Review timed out — the PR may be too large. Try a smaller PR."
        : err instanceof Error
          ? err.message
          : "Something went wrong during the review.";
      storeRef.current.setErrorMessage(msg);
      storeRef.current.setPrData(null);
    } finally {
      clearInterval(progressInterval);
      storeRef.current.setIsReviewRunning(false);
    }
  };

  const submit = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;

    const match = trimmed.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (!match) {
      storeRef.current.setErrorMessage(
        'Invalid URL. Use the format: https://github.com/owner/repo/pull/123'
      );
      return;
    }

    const owner = match[1];
    const repo = match[2];
    const prNumber = parseInt(match[3]);

    storeRef.current.resetState();
    storeRef.current.setPrUrl(trimmed);
    storeRef.current.setIsLoadingPR(true);

    fetchPR(
      { data: { owner, repo, prNumber } },
      {
        onSuccess: (data) => {
          storeRef.current.setPrData(data);
          storeRef.current.setIsLoadingPR(false);
          startReview(data);
        },
        onError: (err: unknown) => {
          storeRef.current.setIsLoadingPR(false);
          const status = (err as { status?: number })?.status;
          const msg =
            status === 404
              ? `PR not found. Check that the URL is correct and the PR exists.\n\nTried: ${trimmed}`
              : status === 403
                ? "GitHub rate limit hit or access denied. Make sure GITHUB_TOKEN is set with repo access."
                : `GitHub error (${status ?? "unknown"}): Could not fetch this PR.`;
          storeRef.current.setErrorMessage(msg);
        },
      }
    );
  };

  return { submit, isPending };
}
