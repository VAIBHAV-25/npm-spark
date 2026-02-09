import { useGitHubRepo } from '@/hooks/usePackages';
import { formatRelativeDate } from '@/lib/npm-api';
import { Github, Star, GitFork, AlertCircle as IssueIcon, Eye, Loader2, TrendingUp } from 'lucide-react';

interface GitHubMetricsProps {
  repositoryUrl?: string;
}

export function GitHubMetrics({ repositoryUrl }: GitHubMetricsProps) {
  const { data: repoInfo, isLoading } = useGitHubRepo(repositoryUrl);

  if (isLoading) {
    return (
      <div className="glass-card p-4 animate-fade-in-up">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!repoInfo) {
    return null;
  }

  return (
    <div className="glass-card p-4 space-y-3 hover:scale-105 transition-transform animate-fade-in-up">
      <h4 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Github className="h-4 w-4" />
        GitHub Activity
      </h4>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card hover:bg-muted/30 transition-colors">
          <span className="stat-label flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            Stars
          </span>
          <span className="stat-value text-base text-foreground">
            {repoInfo.stargazers_count.toLocaleString()}
          </span>
        </div>
        
        <div className="stat-card hover:bg-muted/30 transition-colors">
          <span className="stat-label flex items-center gap-1">
            <GitFork className="h-3 w-3 text-blue-500" />
            Forks
          </span>
          <span className="stat-value text-base text-foreground">
            {repoInfo.forks_count.toLocaleString()}
          </span>
        </div>
        
        <div className="stat-card hover:bg-muted/30 transition-colors">
          <span className="stat-label flex items-center gap-1">
            <IssueIcon className="h-3 w-3 text-red-500" />
            Open Issues
          </span>
          <span className="stat-value text-base text-foreground">
            {repoInfo.open_issues_count.toLocaleString()}
          </span>
        </div>
        
        <div className="stat-card hover:bg-muted/30 transition-colors">
          <span className="stat-label flex items-center gap-1">
            <Eye className="h-3 w-3 text-green-500" />
            Watchers
          </span>
          <span className="stat-value text-base text-foreground">
            {repoInfo.watchers_count.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Last commit</span>
          <span className="text-foreground font-medium">{formatRelativeDate(repoInfo.pushed_at)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Primary language</span>
          <span className="text-primary font-mono text-sm">{repoInfo.language || 'N/A'}</span>
        </div>
      </div>
      
      {repoInfo.topics && repoInfo.topics.length > 0 && (
        <div className="border-t border-border pt-3">
          <span className="text-xs text-muted-foreground mb-2 block">Topics</span>
          <div className="flex flex-wrap gap-1">
            {repoInfo.topics.slice(0, 4).map((topic) => (
              <span key={topic} className="chip text-xs">
                {topic}
              </span>
            ))}
            {repoInfo.topics.length > 4 && (
              <span className="text-xs text-muted-foreground">+{repoInfo.topics.length - 4}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
