import { forwardRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SearchBoxProps {
  className?: string;
  large?: boolean;
  initialValue?: string;
  autoFocus?: boolean;
}

export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ className, large = false, initialValue = '', autoFocus = false, ...props }, ref) => {
    const [query, setQuery] = useState(initialValue);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    };

    return (
      <form onSubmit={handleSubmit} className={cn('w-full', className)} {...props}>
        <div className={cn(
          'relative group',
          large && 'max-w-2xl mx-auto'
        )}>
          <div className={cn(
            'absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500',
            large && 'blur-2xl'
          )} />
          <div className="relative">
            <Search className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary',
              large ? 'h-6 w-6' : 'h-5 w-5'
            )} />
            <input
              ref={ref}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search packages..."
              autoFocus={autoFocus}
              className={cn(
                'w-full bg-secondary/50 border border-border rounded-xl font-mono placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all',
                large 
                  ? 'pl-14 pr-20 py-5 text-lg' 
                  : 'pl-12 pr-16 py-3 text-base'
              )}
            />
            <div className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2',
            )}>
              <kbd className="hidden sm:inline-flex h-7 select-none items-center gap-1 rounded-md border border-border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground">
                <span className="text-xs">⏎</span> Enter
              </kbd>
            </div>
          </div>
        </div>
      </form>
    );
  }
);

SearchBox.displayName = 'SearchBox';
