import { Link, useNavigate } from 'react-router-dom';
import { Search, GitCompare, Menu, Bookmark } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useSaved } from '@/hooks/useSaved';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { SearchSuggestionsDropdown } from '@/components/SearchSuggestionsDropdown';
import { addRecentSearch } from '@/lib/recent-searches';

interface HeaderProps {
  initialQuery?: string;
  showSearch?: boolean;
}

export function Header({ initialQuery = '', showSearch = true }: HeaderProps) {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const saved = useSaved();
  const suggestions = useSearchSuggestions(query);
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setOpenSuggestions(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addRecentSearch(query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpenSuggestions(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-mono text-xl font-bold">
          <span className="text-primary">./</span>
          <span className="text-foreground">npmx</span>
        </Link>

        {showSearch && (
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="search packages..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                  setOpenSuggestions(true);
                }}
                onFocus={() => setOpenSuggestions(true)}
                onBlur={() => window.setTimeout(() => setOpenSuggestions(false), 120)}
                onKeyDown={(e) => {
                  if (!openSuggestions || suggestions.items.length === 0) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.min(i + 1, suggestions.items.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter") {
                    const picked = suggestions.items[activeIndex];
                    if (picked) {
                      e.preventDefault();
                      addRecentSearch(picked.value);
                      navigate(`/package/${encodeURIComponent(picked.value)}`);
                      setOpenSuggestions(false);
                      inputRef.current?.blur();
                    }
                  } else if (e.key === "Escape") {
                    setOpenSuggestions(false);
                  }
                }}
                className="w-full pl-10 pr-12 bg-secondary border-border focus:border-primary font-mono"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                /
              </kbd>
              <SearchSuggestionsDropdown
                open={openSuggestions}
                items={suggestions.items}
                activeIndex={activeIndex}
                onPick={(value) => {
                  addRecentSearch(value);
                  navigate(`/package/${encodeURIComponent(value)}`);
                  setOpenSuggestions(false);
                  inputRef.current?.blur();
                }}
              />
            </div>
          </form>
        )}

        <nav className="hidden items-center gap-2 md:flex">
          <Link to="/saved">
            <Button variant="ghost" size="sm" className="font-mono text-sm gap-2">
              <Bookmark className="h-4 w-4" />
              saved
              {(saved.favorites.length + saved.watchlist.length) > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                  {saved.favorites.length + saved.watchlist.length}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/compare">
            <Button variant="ghost" size="sm" className="font-mono text-sm gap-2">
              <GitCompare className="h-4 w-4" />
              compare
              <kbd className="hidden lg:inline-flex h-5 select-none items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                c
              </kbd>
            </Button>
          </Link>
        </nav>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col gap-4 pt-8">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="search packages..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActiveIndex(0);
                      setOpenSuggestions(true);
                    }}
                    onFocus={() => setOpenSuggestions(true)}
                    onBlur={() => window.setTimeout(() => setOpenSuggestions(false), 120)}
                    onKeyDown={(e) => {
                      if (!openSuggestions || suggestions.items.length === 0) return;
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setActiveIndex((i) => Math.min(i + 1, suggestions.items.length - 1));
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setActiveIndex((i) => Math.max(i - 1, 0));
                      } else if (e.key === "Enter") {
                        const picked = suggestions.items[activeIndex];
                        if (picked) {
                          e.preventDefault();
                          addRecentSearch(picked.value);
                          navigate(`/package/${encodeURIComponent(picked.value)}`);
                          setOpenSuggestions(false);
                        }
                      } else if (e.key === "Escape") {
                        setOpenSuggestions(false);
                      }
                    }}
                    className="w-full pl-10 bg-secondary border-border font-mono"
                  />
                  <SearchSuggestionsDropdown
                    open={openSuggestions}
                    items={suggestions.items}
                    activeIndex={activeIndex}
                    onPick={(value) => {
                      addRecentSearch(value);
                      navigate(`/package/${encodeURIComponent(value)}`);
                      setOpenSuggestions(false);
                    }}
                  />
                </div>
              </form>
              <Link to="/saved">
                <Button variant="ghost" className="w-full justify-start gap-2 font-mono">
                  <Bookmark className="h-4 w-4" />
                  saved
                  {(saved.favorites.length + saved.watchlist.length) > 0 && (
                    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                      {saved.favorites.length + saved.watchlist.length}
                    </span>
                  )}
                </Button>
              </Link>
              <Link to="/compare">
                <Button variant="ghost" className="w-full justify-start gap-2 font-mono">
                  <GitCompare className="h-4 w-4" />
                  compare
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
