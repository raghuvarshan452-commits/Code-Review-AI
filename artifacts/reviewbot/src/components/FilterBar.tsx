import { useReviewStore } from "@/store/useReviewStore";
import { ReviewComment } from "@workspace/api-client-react";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "critical", label: "Critical" },
  { key: "warning", label: "Warning" },
  { key: "suggestion", label: "Suggestion" },
  { key: "security", label: "Security" },
  { key: "bug", label: "Bugs" },
  { key: "performance", label: "Performance" },
];

interface FilterBarProps {
  comments: ReviewComment[];
}

export default function FilterBar({ comments }: FilterBarProps) {
  const { activeFilter, setActiveFilter } = useReviewStore();

  function getCount(key: string) {
    if (key === "all") return comments.length;
    if (["critical", "warning", "suggestion"].includes(key)) return comments.filter((c) => c.severity === key).length;
    const catMap: Record<string, string> = { security: "security", bug: "bug", performance: "performance" };
    return comments.filter((c) => c.category === catMap[key]).length;
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
      {FILTERS.map(({ key, label }) => {
        const count = getCount(key);
        const isActive = activeFilter === key;
        return (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            data-testid={`filter-${key}`}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 16px",
              borderRadius: 9999, fontSize: 13, fontFamily: "Barlow, sans-serif", fontWeight: 300,
              cursor: "pointer", border: "none", transition: "all 0.15s ease",
              background: isActive ? "rgba(255,255,255,0.10)" : "transparent",
              color: isActive ? "white" : "rgba(255,255,255,0.50)",
              outline: isActive ? "1px solid rgba(255,255,255,0.20)" : "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "rgba(255,255,255,0.70)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.50)";
              }
            }}
          >
            {label}
            <span style={{ fontSize: 11, opacity: isActive ? 0.7 : 0.45 }}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
