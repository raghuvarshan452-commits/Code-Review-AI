import { formatDistanceToNow } from 'date-fns';
import { useReviewStore } from '@/store/useReviewStore';
import { Button } from '@/components/ui/button';
import { Trash2, MessageSquareWarning } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Sidebar() {
  const { reviewHistory, loadFromHistory, clearHistory, prUrl } = useReviewStore();

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-[280px] bg-background border-r border-border flex flex-col">
      <div className="p-4 pb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Recent Reviews</h2>
        {reviewHistory.length > 0 && (
          <div className="px-2 py-0.5 rounded-full bg-border text-xs font-medium text-muted-foreground">
            {reviewHistory.length}
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-3">
        {reviewHistory.length === 0 ? (
          <div className="text-sm text-muted-foreground px-1 py-4">
            No recent reviews found.
          </div>
        ) : (
          <div className="space-y-1 pb-4">
            {reviewHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => loadFromHistory(item)}
                className={`w-full text-left p-3 rounded-md border transition-all duration-200 group ${
                  prUrl === item.prUrl 
                    ? 'bg-white border-primary/20 shadow-sm' 
                    : 'bg-transparent border-transparent hover:bg-white hover:border-border hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-semibold text-sm text-foreground truncate max-w-[170px]">
                    {item.repo} <span className="text-muted-foreground font-normal">#{item.prNumber}</span>
                  </span>
                  <span className="shrink-0 flex items-center gap-1 text-xs font-medium bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                    <MessageSquareWarning className="w-3 h-3" />
                    {item.issueCount}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {reviewHistory.length > 0 && (
        <div className="p-4 border-t border-border mt-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearHistory}
            className="w-full text-muted-foreground hover:text-destructive hover:bg-red-50 justify-start"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear history
          </Button>
        </div>
      )}
    </aside>
  );
}
