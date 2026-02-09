import { Link } from 'react-router-dom';
import { Package, Users, Sparkles, TrendingUp } from 'lucide-react';

interface FrequentlyPairedPackagesProps {
  packageName: string;
}

const packageEcosystems: Record<string, Array<{ name: string; reason: string; popularity: number }>> = {
  'react': [
    { name: 'react-router-dom', reason: 'Routing solution', popularity: 95 },
    { name: 'react-hook-form', reason: 'Form management', popularity: 85 },
    { name: 'axios', reason: 'HTTP client', popularity: 90 },
    { name: 'zustand', reason: 'State management', popularity: 80 },
    { name: 'tailwindcss', reason: 'Styling', popularity: 88 },
  ],
  'vue': [
    { name: 'vue-router', reason: 'Routing solution', popularity: 95 },
    { name: 'pinia', reason: 'State management', popularity: 85 },
    { name: 'axios', reason: 'HTTP client', popularity: 88 },
    { name: 'vuelidate', reason: 'Validation', popularity: 75 },
  ],
  'express': [
    { name: 'cors', reason: 'CORS middleware', popularity: 92 },
    { name: 'helmet', reason: 'Security headers', popularity: 85 },
    { name: 'morgan', reason: 'HTTP logger', popularity: 80 },
    { name: 'body-parser', reason: 'Request parsing', popularity: 88 },
    { name: 'jsonwebtoken', reason: 'JWT auth', popularity: 90 },
  ],
  'next': [
    { name: 'react', reason: 'Core dependency', popularity: 100 },
    { name: 'tailwindcss', reason: 'Styling', popularity: 90 },
    { name: 'swr', reason: 'Data fetching', popularity: 82 },
    { name: 'next-auth', reason: 'Authentication', popularity: 88 },
  ],
  'typescript': [
    { name: '@types/node', reason: 'Node.js types', popularity: 95 },
    { name: 'ts-node', reason: 'TS execution', popularity: 85 },
    { name: 'eslint', reason: 'Linting', popularity: 88 },
    { name: 'prettier', reason: 'Code formatting', popularity: 90 },
  ],
  'jest': [
    { name: '@testing-library/react', reason: 'React testing', popularity: 90 },
    { name: '@testing-library/jest-dom', reason: 'DOM matchers', popularity: 88 },
    { name: 'ts-jest', reason: 'TypeScript support', popularity: 85 },
  ],
  'webpack': [
    { name: 'webpack-cli', reason: 'CLI tool', popularity: 95 },
    { name: 'webpack-dev-server', reason: 'Dev server', popularity: 90 },
    { name: 'html-webpack-plugin', reason: 'HTML generation', popularity: 85 },
    { name: 'babel-loader', reason: 'Babel integration', popularity: 88 },
  ],
  'mongoose': [
    { name: 'mongodb', reason: 'Database driver', popularity: 100 },
    { name: 'express', reason: 'Web framework', popularity: 85 },
    { name: 'dotenv', reason: 'Config management', popularity: 90 },
  ],
  'prisma': [
    { name: '@prisma/client', reason: 'Client library', popularity: 100 },
    { name: 'express', reason: 'Web framework', popularity: 80 },
    { name: 'next', reason: 'Full-stack framework', popularity: 85 },
  ],
  'axios': [
    { name: 'react', reason: 'UI framework', popularity: 85 },
    { name: 'express', reason: 'Backend framework', popularity: 80 },
    { name: 'dotenv', reason: 'Environment vars', popularity: 75 },
  ],
  'tailwindcss': [
    { name: 'autoprefixer', reason: 'CSS vendor prefixing', popularity: 95 },
    { name: 'postcss', reason: 'CSS processing', popularity: 95 },
    { name: 'react', reason: 'UI framework', popularity: 88 },
  ],
};

function getCommonlyPaired(packageName: string) {
  const normalized = packageName.toLowerCase();
  return packageEcosystems[normalized] || [];
}

export function FrequentlyPairedPackages({ packageName }: FrequentlyPairedPackagesProps) {
  const pairedPackages = getCommonlyPaired(packageName);

  if (pairedPackages.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-4 space-y-3 hover:scale-105 transition-transform animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Frequently Paired With
        </h4>
        <Sparkles className="h-4 w-4 text-yellow-500" />
      </div>

      <p className="text-xs text-muted-foreground">
        Packages commonly used together by the community
      </p>

      <div className="space-y-2">
        {pairedPackages.map((pkg) => (
          <Link
            key={pkg.name}
            to={`/package/${encodeURIComponent(pkg.name)}`}
            className="block group hover:bg-muted/30 rounded-lg p-2 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <Package className="h-4 w-4 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-medium text-foreground truncate">
                    {pkg.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{pkg.reason}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs font-medium text-success">{pkg.popularity}%</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">
          💡 Installing these together can save development time and ensure compatibility
        </p>
      </div>
    </div>
  );
}
