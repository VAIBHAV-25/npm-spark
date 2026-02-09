import { FileCode, CheckCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface TypeScriptScoreProps {
  packageName: string;
  version?: string;
}

interface TypesInfo {
  hasBuiltInTypes: boolean;
  hasDefinitelyTyped: boolean;
  typesPackage?: string;
  score: number;
  status: 'excellent' | 'good' | 'partial' | 'none';
}

async function checkTypeScriptSupport(packageName: string): Promise<TypesInfo> {
  try {
    // Check if package has built-in types
    const pkgResponse = await fetch(`https://registry.npmjs.org/${packageName}`);
    if (!pkgResponse.ok) throw new Error('Package not found');
    
    const pkgData = await pkgResponse.json();
    const latestVersion = pkgData['dist-tags'].latest;
    const versionInfo = pkgData.versions[latestVersion];
    
    // Check for types in package.json
    const hasBuiltInTypes = !!(
      versionInfo.types ||
      versionInfo.typings ||
      versionInfo.exports?.types ||
      (versionInfo.files && versionInfo.files.some((f: string) => 
        f.includes('.d.ts') || f.includes('types')
      ))
    );

    // Check for @types package
    const typesPackageName = `@types/${packageName.replace('@', '').replace('/', '__')}`;
    let hasDefinitelyTyped = false;
    
    try {
      const typesResponse = await fetch(`https://registry.npmjs.org/${typesPackageName}`);
      hasDefinitelyTyped = typesResponse.ok;
    } catch {
      hasDefinitelyTyped = false;
    }

    // Calculate score
    let score = 0;
    let status: TypesInfo['status'] = 'none';

    if (hasBuiltInTypes) {
      score = 100;
      status = 'excellent';
    } else if (hasDefinitelyTyped) {
      score = 75;
      status = 'good';
    } else {
      // Check if it's pure JavaScript with JSDoc
      const hasJSDoc = versionInfo.description?.includes('TypeScript') || 
                       versionInfo.keywords?.includes('typescript') ||
                       versionInfo.keywords?.includes('types');
      if (hasJSDoc) {
        score = 40;
        status = 'partial';
      } else {
        score = 0;
        status = 'none';
      }
    }

    return {
      hasBuiltInTypes,
      hasDefinitelyTyped,
      typesPackage: hasDefinitelyTyped ? typesPackageName : undefined,
      score,
      status,
    };
  } catch (error) {
    console.error('Error checking TypeScript support:', error);
    return {
      hasBuiltInTypes: false,
      hasDefinitelyTyped: false,
      score: 0,
      status: 'none',
    };
  }
}

export function TypeScriptScore({ packageName }: TypeScriptScoreProps) {
  const { data: typesInfo, isLoading } = useQuery({
    queryKey: ['typescript-support', packageName],
    queryFn: () => checkTypeScriptSupport(packageName),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <FileCode className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold">TypeScript Support</h3>
        </div>
        <p className="text-sm text-muted-foreground">Checking type definitions...</p>
      </div>
    );
  }

  if (!typesInfo) return null;

  const getStatusConfig = () => {
    switch (typesInfo.status) {
      case 'excellent':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          label: 'Excellent TypeScript Support',
          description: 'Built-in type definitions included',
        };
      case 'good':
        return {
          icon: CheckCircle,
          color: 'text-blue-500',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          label: 'Good TypeScript Support',
          description: 'Types available via DefinitelyTyped',
        };
      case 'partial':
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          label: 'Partial TypeScript Support',
          description: 'May have JSDoc or community types',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-500',
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/20',
          label: 'No TypeScript Support',
          description: 'No type definitions available',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <FileCode className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">TypeScript Support</h3>
      </div>

      <div className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-border"
              />
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(typesInfo.score / 100) * 200} 200`}
                className={cn('transition-all duration-1000', config.color)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{typesInfo.score}</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={cn('h-5 w-5', config.color)} />
              <span className="font-semibold">{config.label}</span>
            </div>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>

        {/* Details */}
        <div className={cn('p-4 rounded-lg border', config.bg, config.border)}>
          <div className="space-y-2">
            {typesInfo.hasBuiltInTypes && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Built-in type definitions</span>
              </div>
            )}

            {typesInfo.hasDefinitelyTyped && typesInfo.typesPackage && (
              <div className="flex items-col gap-2 text-sm">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p>Types available via DefinitelyTyped</p>
                  <code className="text-xs font-mono bg-background/50 px-2 py-1 rounded mt-1 inline-block">
                    npm install --save-dev {typesInfo.typesPackage}
                  </code>
                </div>
              </div>
            )}

            {!typesInfo.hasBuiltInTypes && !typesInfo.hasDefinitelyTyped && (
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground mb-1">No official type definitions</p>
                  <p className="text-xs text-muted-foreground">
                    You may need to create custom type declarations or use 'any' types
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resources */}
        <div className="flex gap-2">
          {typesInfo.hasDefinitelyTyped && typesInfo.typesPackage && (
            <a
              href={`https://www.npmjs.com/package/${typesInfo.typesPackage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View @types package
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <a
            href={`https://www.typescriptlang.org/dt/search?search=${packageName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Search TypeScript docs
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
