import { useReviewStore } from '@/store/useReviewStore';
import { useFetchPR } from '@workspace/api-client-react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function Navbar() {
  const { prUrl, setPrUrl, resetState, setIsLoadingPR, setIsReviewRunning, setPrData, setReviewComments, setReviewProgress, saveToHistory } = useReviewStore();
  const [inputUrl, setInputUrl] = useState(prUrl);
  const { mutate: fetchPR } = useFetchPR();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl) return;

    const match = inputUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/);
    if (!match) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid GitHub PR URL (e.g., https://github.com/owner/repo/pull/123)",
        variant: "destructive"
      });
      return;
    }

    const owner = match[1];
    const repo = match[2];
    const prNumber = parseInt(match[3]);

    resetState();
    setPrUrl(inputUrl);
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
            title: "Error fetching PR",
            description: "Failed to fetch PR data from GitHub. Check the URL and your token.",
            variant: "destructive"
          });
        }
      }
    );
  };

  const startReview = async (prData: any) => {
    setIsReviewRunning(true);
    setReviewProgress(0);
    
    // Fake progress animation
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress = Math.min(85, currentProgress + 2);
      setReviewProgress(currentProgress);
    }, 200);

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: prData.files })
      });
      
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
      }
      
      const comments = JSON.parse(buffer);
      setReviewComments(comments);
      setReviewProgress(100);
      
      // Auto-save to history after state updates (we use a timeout or effect, but effect is better)
      setTimeout(() => saveToHistory(), 100);
      
    } catch (err) {
      toast({
        title: "Error running review",
        description: "Failed to analyze the PR",
        variant: "destructive"
      });
    } finally {
      clearInterval(progressInterval);
      setIsReviewRunning(false);
    }
  };

  const handleNewReview = () => {
    resetState();
    setInputUrl('');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-border z-50 flex items-center px-4 justify-between">
      <div className="flex items-center gap-2 w-[264px] shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="font-bold text-[15px] tracking-tight text-foreground">ReviewBot AI</span>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-[480px]">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Paste GitHub PR URL..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground"
          />
        </div>
      </form>

      <div className="w-[264px] shrink-0 flex justify-end">
        <Button onClick={handleNewReview} variant="outline" size="sm" className="h-8 gap-1.5 font-medium rounded-md shadow-sm border-border text-foreground hover:bg-background">
          <Plus className="w-4 h-4" />
          New Review
        </Button>
      </div>
    </header>
  );
}
