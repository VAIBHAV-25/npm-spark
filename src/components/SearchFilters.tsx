import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Filter, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface SearchFiltersState {
  minDownloads?: number;
  lastUpdated?: 'week' | 'month' | 'year' | 'all';
  license?: string[];
  hasTypes?: boolean;
  hasTests?: boolean;
  zeroDeps?: boolean;
  frameworks?: string[];
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onChange: (filters: SearchFiltersState) => void;
  onClear: () => void;
}

export function SearchFilters({ filters, onChange, onClear }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = Object.values(filters).some((v) => 
    v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  );

  const activeFilterCount = [
    filters.minDownloads && 'downloads',
    filters.lastUpdated && filters.lastUpdated !== 'all' && 'updated',
    filters.license && filters.license.length > 0 && 'license',
    filters.hasTypes && 'typescript',
    filters.hasTests && 'tests',
    filters.zeroDeps && 'zero-deps',
    filters.frameworks && filters.frameworks.length > 0 && 'framework',
  ].filter(Boolean).length;

  const licenses = ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC', 'GPL-3.0'];
  const frameworks = ['react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt'];

  const handleLicenseToggle = (license: string) => {
    const current = filters.license || [];
    const updated = current.includes(license)
      ? current.filter((l) => l !== license)
      : [...current, license];
    onChange({ ...filters, license: updated });
  };

  const handleFrameworkToggle = (framework: string) => {
    const current = filters.frameworks || [];
    const updated = current.includes(framework)
      ? current.filter((f) => f !== framework)
      : [...current, framework];
    onChange({ ...filters, frameworks: updated });
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-primary text-primary-foreground px-1.5 text-[10px] font-medium">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          {/* Downloads Filter */}
          <DropdownMenuLabel>Minimum Weekly Downloads</DropdownMenuLabel>
          <div className="px-2 pb-2">
            <Input
              type="number"
              placeholder="e.g., 1000000"
              value={filters.minDownloads || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : undefined;
                onChange({ ...filters, minDownloads: value });
              }}
              className="h-9"
            />
          </div>

          <DropdownMenuSeparator />

          {/* Last Updated */}
          <DropdownMenuLabel>Last Updated</DropdownMenuLabel>
          {['week', 'month', 'year', 'all'].map((period) => (
            <DropdownMenuCheckboxItem
              key={period}
              checked={filters.lastUpdated === period}
              onCheckedChange={() => {
                onChange({
                  ...filters,
                  lastUpdated: period as SearchFiltersState['lastUpdated'],
                });
              }}
            >
              {period === 'all' ? 'Any time' : `Last ${period}`}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />

          {/* License */}
          <DropdownMenuLabel>License</DropdownMenuLabel>
          {licenses.map((license) => (
            <DropdownMenuCheckboxItem
              key={license}
              checked={filters.license?.includes(license) || false}
              onCheckedChange={() => handleLicenseToggle(license)}
            >
              {license}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />

          {/* Framework */}
          <DropdownMenuLabel>Framework</DropdownMenuLabel>
          {frameworks.map((framework) => (
            <DropdownMenuCheckboxItem
              key={framework}
              checked={filters.frameworks?.includes(framework) || false}
              onCheckedChange={() => handleFrameworkToggle(framework)}
            >
              {framework}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />

          {/* Quick Filters */}
          <DropdownMenuLabel>Quick Filters</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={filters.hasTypes || false}
            onCheckedChange={(checked) => {
              onChange({ ...filters, hasTypes: checked });
            }}
          >
            Has TypeScript Types
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.hasTests || false}
            onCheckedChange={(checked) => {
              onChange({ ...filters, hasTests: checked });
            }}
          >
            Has Tests
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.zeroDeps || false}
            onCheckedChange={(checked) => {
              onChange({ ...filters, zeroDeps: checked });
            }}
          >
            Zero Dependencies
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Clear filters
        </Button>
      )}

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.minDownloads && (
            <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded">
              {(filters.minDownloads / 1000000).toFixed(1)}M+ downloads
              <button
                onClick={() => onChange({ ...filters, minDownloads: undefined })}
                className="hover:text-primary-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.license && filters.license.length > 0 && (
            <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded">
              {filters.license.join(', ')}
              <button
                onClick={() => onChange({ ...filters, license: [] })}
                className="hover:text-primary-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.hasTypes && (
            <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded">
              TypeScript
              <button
                onClick={() => onChange({ ...filters, hasTypes: false })}
                className="hover:text-primary-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.zeroDeps && (
            <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded">
              Zero Dependencies
              <button
                onClick={() => onChange({ ...filters, zeroDeps: false })}
                className="hover:text-primary-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
