import { useReviewStore } from "@/store/useReviewStore";
import { usePRSubmit } from "@/hooks/usePRSubmit";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Navbar() {
  const { prUrl, resetState } = useReviewStore();
  const [inputUrl, setInputUrl] = useState(prUrl);
  const { submit, isPending } = usePRSubmit();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    submit(inputUrl);
  };

  const handleNewReview = () => {
    resetState();
    setInputUrl("");
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center px-4 justify-between"
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #E5E7EB",
        boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex items-center gap-2 w-[240px] shrink-0">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "#1A6B3C" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="font-bold text-[15px] tracking-tight text-foreground">
          ReviewBot AI
        </span>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-[520px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Paste GitHub PR URL here and press Enter…"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            disabled={isPending}
            className="w-full h-9 pl-9 pr-4 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-muted-foreground"
            style={{
              border: "1.5px solid #1A6B3C",
              background: "#F6FBF8",
              color: "#111",
            }}
          />
        </div>
      </form>

      <div className="w-[240px] shrink-0 flex justify-end">
        <Button
          onClick={handleNewReview}
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 font-medium rounded-md"
        >
          <Plus className="w-4 h-4" />
          New Review
        </Button>
      </div>
    </header>
  );
}
