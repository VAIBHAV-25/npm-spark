import { SuggestionItem } from "@/hooks/useSearchSuggestions";
import { cn } from "@/lib/utils";
import { Clock, Flame, Package } from "lucide-react";

function iconFor(item: SuggestionItem) {
  if (item.type === "recent") return <Clock className="h-4 w-4 text-muted-foreground" />;
  if (item.type === "popular") return <Flame className="h-4 w-4 text-muted-foreground" />;
  return <Package className="h-4 w-4 text-primary" />;
}

export function SearchSuggestionsDropdown({
  open,
  items,
  activeIndex,
  onPick,
  className,
}: {
  open: boolean;
  items: SuggestionItem[];
  activeIndex: number;
  onPick: (value: string) => void;
  className?: string;
}) {
  if (!open || items.length === 0) return null;

  return (
    <div
      className={cn(
        "absolute left-0 right-0 top-full mt-2 z-[300] bg-card border-2 border-primary/30 rounded-xl shadow-2xl",
        className,
      )}
      role="listbox"
    >
      <div className="max-h-[280px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {items.map((it, idx) => (
          <button
            key={`${it.type}:${it.value}`}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick(it.value)}
            className={cn(
              "w-full text-left px-3 py-2 flex items-start gap-3 border-b border-border last:border-b-0",
              idx === activeIndex ? "bg-muted/40" : "hover:bg-muted/30",
            )}
            role="option"
            aria-selected={idx === activeIndex}
          >
            <div className="mt-0.5 shrink-0">{iconFor(it)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-foreground truncate">{it.value}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {it.type === "package" ? "package" : it.type}
                </span>
              </div>
              {"description" in it && it.description ? (
                <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {it.description}
                </div>
              ) : null}
            </div>
          </button>
        ))}
      </div>
      <div className="px-3 py-2 text-[11px] text-muted-foreground bg-muted/20 flex items-center justify-between">
        <span>↑/↓ to navigate, Enter to select</span>
        <span>Esc to close</span>
      </div>
    </div>
  );
}

