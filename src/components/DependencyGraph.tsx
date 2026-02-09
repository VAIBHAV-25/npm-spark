import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Network, ChevronRight, ChevronDown, Package, AlertTriangle, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface DependencyNode {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  depth: number;
}

interface DependencyGraphProps {
  packageName: string;
  version: string;
  maxDepth?: number;
}

async function fetchDependencyTree(
  packageName: string,
  version: string,
  maxDepth: number = 2,
  currentDepth: number = 0,
  visited: Set<string> = new Set()
): Promise<DependencyNode[]> {
  if (currentDepth >= maxDepth) return [];
  
  const key = `${packageName}@${version}`;
  if (visited.has(key)) return []; // Avoid circular dependencies
  visited.add(key);

  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    const versionData = data.versions[version] || data.versions[data['dist-tags'].latest];
    const dependencies = versionData?.dependencies || {};

    const nodes: DependencyNode[] = [
      {
        name: packageName,
        version,
        dependencies,
        depth: currentDepth,
      },
    ];

    // Recursively fetch dependencies (limit to first 5 to avoid too many requests)
    const depEntries = Object.entries(dependencies).slice(0, 5);
    for (const [depName, depVersion] of depEntries) {
      const cleanVersion = (depVersion as string).replace(/^[\^~>=<]/, '');
      const childNodes = await fetchDependencyTree(
        depName,
        cleanVersion,
        maxDepth,
        currentDepth + 1,
        visited
      );
      nodes.push(...childNodes);
    }

    return nodes;
  } catch (error) {
    console.error('Error fetching dependency tree:', error);
    return [];
  }
}

function DependencyTreeNode({ node, isLast }: { node: DependencyNode; isLast: boolean }) {
  const [expanded, setExpanded] = useState(node.depth === 0);
  const hasDeps = node.dependencies && Object.keys(node.dependencies).length > 0;
  const depCount = hasDeps ? Object.keys(node.dependencies).length : 0;

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded hover:bg-muted/50 transition-colors group',
          node.depth > 0 && 'ml-6'
        )}
      >
        {node.depth > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
        )}
        
        {hasDeps ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 hover:text-primary"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        <Package className="h-4 w-4 text-primary shrink-0" />
        
        <Link
          to={`/package/${encodeURIComponent(node.name)}`}
          className="font-mono text-sm hover:text-primary hover:underline truncate"
        >
          {node.name}
        </Link>
        
        <span className="text-xs text-muted-foreground shrink-0">
          {node.version}
        </span>

        {hasDeps && (
          <span className="text-xs text-muted-foreground ml-auto">
            {depCount} {depCount === 1 ? 'dep' : 'deps'}
          </span>
        )}
      </div>

      {expanded && hasDeps && (
        <div className="ml-4 border-l border-border">
          {Object.entries(node.dependencies!).slice(0, 10).map(([depName, depVersion], idx, arr) => {
            const cleanVersion = depVersion.replace(/^[\^~>=<]/, '');
            return (
              <DependencyTreeNode
                key={`${depName}-${cleanVersion}`}
                node={{
                  name: depName,
                  version: cleanVersion,
                  dependencies: {},
                  depth: node.depth + 1,
                }}
                isLast={idx === arr.length - 1}
              />
            );
          })}
          {Object.keys(node.dependencies!).length > 10 && (
            <div className="ml-10 py-2 text-xs text-muted-foreground">
              ... and {Object.keys(node.dependencies!).length - 10} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DependencyGraph({ packageName, version, maxDepth = 2 }: DependencyGraphProps) {
  const { data: tree, isLoading, error } = useQuery({
    queryKey: ['dependency-tree', packageName, version, maxDepth],
    queryFn: () => fetchDependencyTree(packageName, version, maxDepth),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Network className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold">Dependency Tree</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            Building dependency tree...
          </span>
        </div>
      </div>
    );
  }

  if (error || !tree || tree.length === 0) {
    return (
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Network className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Dependency Tree</h3>
        </div>
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <p className="text-sm text-muted-foreground">
            Unable to load dependency tree
          </p>
        </div>
      </div>
    );
  }

  const rootNode = tree[0];
  const totalDeps = tree.length - 1;

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Network className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Dependency Tree</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {totalDeps} {totalDeps === 1 ? 'dependency' : 'dependencies'} found
        </span>
      </div>

      <div className="space-y-1 max-h-[600px] overflow-y-auto custom-scrollbar">
        <DependencyTreeNode node={rootNode} isLast={false} />
      </div>

      {maxDepth < 3 && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">
            💡 Showing {maxDepth} level{maxDepth > 1 ? 's' : ''} deep. Some dependencies may have
            more sub-dependencies not shown here.
          </p>
        </div>
      )}
    </div>
  );
}
