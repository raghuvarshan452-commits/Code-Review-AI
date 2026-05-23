import { useFetchPR } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useReviewStore } from "@/store/useReviewStore";
import { useRef } from "react";

const REVIEW_TIMEOUT_MS = 180_000; // 3 minutes

export function usePRSubmit() {
  const store = useReviewStore();
  const { mutate: fetchPR, isPending } = useFetchPR();
  const { toast } = useToast();
  // Keep a stable ref to the store so async callbacks don't go stale
  const storeRef = useRef(store);
  storeRef.current = store;

  const startReview = async (prData: Parameters<typeof store.setPrData>[0]) => {
    if (!prData) return;
    const s = storeRef.current;
    s.setIsReviewRunning(true);
    s.setReviewProgress(0);

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
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
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
        toast({ title: "Review complete", description: "No issues found in this PR." });
        setTimeout(() => storeRef.current.saveToHistory(), 100);
        return;
      }

      // Claude sometimes wraps output in markdown fences — strip them
      const cleaned = trimmed.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

      let comments;
      try {
        comments = JSON.parse(cleaned);
      } catch {
        throw new Error("AI returned unexpected output. Please try again.");
      }

      if (!Array.isArray(comments)) {
        throw new Error("AI returned unexpected output. Please try again.");
      }

      storeRef.current.setReviewComments(comments);
      storeRef.current.setReviewProgress(100);
      setTimeout(() => storeRef.current.saveToHistory(), 100);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort =
        err instanceof Error && err.name === "AbortError";
      toast({
        title: isAbort ? "Review timed out" : "Review failed",
        description: isAbort
          ? "The review took too long. Try a smaller PR or try again."
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        variant: "destructive",
      });
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
      toast({
        title: "Invalid URL",
        description:
          "Paste a GitHub PR URL like: https://github.com/owner/repo/pull/123",
        variant: "destructive",
      });
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
        onError: () => {
          storeRef.current.setIsLoadingPR(false);
          toast({
            title: "Could not fetch PR",
            description:
              "Check the URL and make sure your GitHub token has repo access.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return { submit, isPending };
}
