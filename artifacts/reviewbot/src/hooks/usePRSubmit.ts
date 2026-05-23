import { useFetchPR } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useReviewStore } from "@/store/useReviewStore";

export function usePRSubmit() {
  const {
    resetState,
    setPrUrl,
    setIsLoadingPR,
    setIsReviewRunning,
    setPrData,
    setReviewComments,
    setReviewProgress,
    saveToHistory,
  } = useReviewStore();
  const { mutate: fetchPR, isPending } = useFetchPR();
  const { toast } = useToast();

  const startReview = async (prData: Parameters<typeof setPrData>[0]) => {
    if (!prData) return;
    setIsReviewRunning(true);
    setReviewProgress(0);

    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress = Math.min(85, currentProgress + 2);
      setReviewProgress(currentProgress);
    }, 200);

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: prData.files }),
      });

      if (!response.ok) {
        throw new Error(`Review failed: ${response.statusText}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
      }

      const comments = JSON.parse(buffer);
      setReviewComments(comments);
      setReviewProgress(100);
      setTimeout(() => saveToHistory(), 100);
    } catch {
      toast({
        title: "Review failed",
        description: "Could not analyze the PR. Please try again.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setIsReviewRunning(false);
    }
  };

  const submit = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;

    const match = trimmed.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (!match) {
      toast({
        title: "Invalid URL",
        description: "Paste a GitHub PR URL like: https://github.com/owner/repo/pull/123",
        variant: "destructive",
      });
      return;
    }

    const owner = match[1];
    const repo = match[2];
    const prNumber = parseInt(match[3]);

    resetState();
    setPrUrl(trimmed);
    setIsLoadingPR(true);

    fetchPR(
      { data: { owner, repo, prNumber } },
      {
        onSuccess: (data) => {
          setPrData(data);
          setIsLoadingPR(false);
          startReview(data);
        },
        onError: () => {
          setIsLoadingPR(false);
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
