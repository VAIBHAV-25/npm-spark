import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InstallCommandProps {
  packageName: string;
  version?: string;
}

type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

const commands: Record<PackageManager, (name: string) => string> = {
  npm: (name) => `npm install ${name}`,
  yarn: (name) => `yarn add ${name}`,
  pnpm: (name) => `pnpm add ${name}`,
  bun: (name) => `bun add ${name}`,
};

export function InstallCommand({ packageName, version }: InstallCommandProps) {
  const [copied, setCopied] = useState(false);
  const [pm, setPm] = useState<PackageManager>('npm');

  const fullPackageName = version ? `${packageName}@${version}` : packageName;
  const command = commands[pm](fullPackageName);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground">
          Get Started
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 gap-2 font-mono text-xs">
              <Terminal className="h-3 w-3" />
              {pm}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(['npm', 'yarn', 'pnpm', 'bun'] as PackageManager[]).map((manager) => (
              <DropdownMenuItem
                key={manager}
                onClick={() => setPm(manager)}
                className="font-mono text-sm"
              >
                {manager}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="relative p-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-destructive/50" />
            <div className="w-3 h-3 rounded-full bg-warning/50" />
            <div className="w-3 h-3 rounded-full bg-success/50" />
          </div>
          <code className="font-mono text-sm text-foreground whitespace-nowrap">
            <span className="text-muted-foreground">$</span> {command}
          </code>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
}
