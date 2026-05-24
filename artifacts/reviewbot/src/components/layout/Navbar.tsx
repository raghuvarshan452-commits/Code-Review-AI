import { useReviewStore } from "@/store/useReviewStore";
import { usePRSubmit } from "@/hooks/usePRSubmit";
import { useAuth, signOut } from "@/hooks/useAuth";
import { Search, Plus, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

function UserAvatar({ name, image }: { name: string; image: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const { user } = useAuth();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "2px 4px",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid #16A34A",
            outline: "1px solid #fff",
            flexShrink: 0,
            background: "#1A6B3C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {image ? (
            <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{initials}</span>
          )}
        </div>
        <ChevronDown
          style={{
            width: 14,
            height: 14,
            color: "#78716C",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 44,
            background: "#FFFFFF",
            border: "1px solid #E2DED7",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            width: 200,
            padding: 8,
            zIndex: 100,
          }}
        >
          <div style={{ padding: "6px 12px 10px" }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#1C1917", margin: 0 }}>{name}</p>
            <p style={{ fontSize: 12, color: "#A8A29E", margin: "2px 0 0" }}>{user?.email ?? ""}</p>
          </div>
          <div style={{ height: 1, background: "#E2DED7", margin: "4px 0" }} />
          <button
            onClick={() => { setOpen(false); signOut(); }}
            style={{
              width: "100%",
              textAlign: "left",
              fontSize: 13,
              color: "#991B1B",
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
          >
            <LogOut style={{ width: 13, height: 13 }} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { prUrl, resetState } = useReviewStore();
  const [inputUrl, setInputUrl] = useState(prUrl);
  const { submit, isPending } = usePRSubmit();
  const { user } = useAuth();

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

      <div className="w-[240px] shrink-0 flex justify-end items-center gap-3">
        <Button
          onClick={handleNewReview}
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 font-medium rounded-md"
        >
          <Plus className="w-4 h-4" />
          New Review
        </Button>
        {user && <UserAvatar name={user.name} image={user.image} />}
      </div>
    </header>
  );
}
