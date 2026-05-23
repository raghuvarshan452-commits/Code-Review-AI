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
    if (["critical", "warning", "suggestion"].includes(key)) {
      return comments.filter((c) => c.severity === key).length;
    }
    const catMap: Record<string, string> = { security: "security", bug: "bug", performance: "performance" };
    return comments.filter((c) => c.category === catMap[key]).length;
  }

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {FILTERS.map(({ key, label }) => {
        const count = getCount(key);
        const isActive = activeFilter === key;
        return (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            data-testid={`filter-${key}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={
              isActive
                ? { background: "#1A6B3C", color: "#fff", border: "1px solid #1A6B3C" }
                : { background: "#fff", color: "#555", border: "1px solid #E8E6E1" }
            }
          >
            {label}
            <span
              className="text-[11px] font-semibold"
              style={isActive ? { opacity: 0.8 } : { opacity: 0.55 }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
