import { useDownloadsRange } from '@/hooks/usePackages';
import { TrendingUp, TrendingDown, Activity, Zap, AlertCircle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface PackageTrendPredictorProps {
  packageName: string;
}

interface TrendAnalysis {
  direction: 'rising' | 'falling' | 'stable';
  momentum: 'strong' | 'moderate' | 'weak';
  prediction: string;
  growthRate: number;
  volatility: number;
  confidence: number;
}

function analyzeTrend(downloads?: Array<{ downloads: number; day: string }>): TrendAnalysis {
  if (!downloads || downloads.length < 14) {
    return {
      direction: 'stable',
      momentum: 'weak',
      prediction: 'Insufficient data for prediction',
      growthRate: 0,
      volatility: 0,
      confidence: 0,
    };
  }

  const recent7 = downloads.slice(-7);
  const previous7 = downloads.slice(-14, -7);
  
  const recentAvg = recent7.reduce((sum, d) => sum + d.downloads, 0) / 7;
  const previousAvg = previous7.reduce((sum, d) => sum + d.downloads, 0) / 7;
  
  const growthRate = ((recentAvg - previousAvg) / previousAvg) * 100;
  
  const variance = recent7.reduce((sum, d) => {
    const diff = d.downloads - recentAvg;
    return sum + (diff * diff);
  }, 0) / 7;
  const volatility = Math.sqrt(variance) / recentAvg * 100;
  
  let direction: 'rising' | 'falling' | 'stable' = 'stable';
  if (growthRate > 5) direction = 'rising';
  else if (growthRate < -5) direction = 'falling';
  
  let momentum: 'strong' | 'moderate' | 'weak' = 'weak';
  if (Math.abs(growthRate) > 20) momentum = 'strong';
  else if (Math.abs(growthRate) > 10) momentum = 'moderate';
  
  let prediction = '';
  let confidence = 0;
  
  if (direction === 'rising') {
    if (momentum === 'strong') {
      prediction = '📈 Rapidly gaining popularity - High adoption expected';
      confidence = 85;
    } else if (momentum === 'moderate') {
      prediction = '📊 Steady growth - Healthy adoption trend';
      confidence = 70;
    } else {
      prediction = '➡️ Slight growth - Stable package';
      confidence = 60;
    }
  } else if (direction === 'falling') {
    if (momentum === 'strong') {
      prediction = '📉 Declining interest - Consider alternatives';
      confidence = 85;
    } else if (momentum === 'moderate') {
      prediction = '⚠️ Decreasing usage - Monitor closely';
      confidence = 70;
    } else {
      prediction = '➡️ Minor decline - Still viable';
      confidence = 60;
    }
  } else {
    prediction = '➡️ Stable usage - Mature package';
    confidence = 75;
  }
  
  return {
    direction,
    momentum,
    prediction,
    growthRate,
    volatility,
    confidence,
  };
}

export function PackageTrendPredictor({ packageName }: PackageTrendPredictorProps) {
  const { data: rangeData } = useDownloadsRange(packageName, 'last-month');
  
  const trend = analyzeTrend(rangeData?.downloads);
  
  const chartData = rangeData?.downloads?.slice(-14).map((d, idx) => ({
    idx,
    value: d.downloads,
  })) || [];

  return (
    <div className="glass-card p-4 space-y-3 hover:scale-105 transition-transform animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          AI Trend Analysis
        </h4>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
          trend.direction === 'rising' ? 'bg-success/20 text-success' : 
          trend.direction === 'falling' ? 'bg-destructive/20 text-destructive' : 
          'bg-muted text-muted-foreground'
        }`}>
          {trend.direction === 'rising' && <TrendingUp className="h-3 w-3" />}
          {trend.direction === 'falling' && <TrendingDown className="h-3 w-3" />}
          {trend.direction === 'stable' && <Activity className="h-3 w-3" />}
          <span className="capitalize">{trend.direction}</span>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={trend.direction === 'rising' ? '#10b981' : trend.direction === 'falling' ? '#ef4444' : '#6b7280'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-2">
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">Prediction</p>
              <p className="text-xs text-muted-foreground">{trend.prediction}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="stat-card">
            <span className="stat-label">Growth Rate</span>
            <span className={`stat-value text-sm ${
              trend.growthRate > 0 ? 'text-success' : 
              trend.growthRate < 0 ? 'text-destructive' : 
              'text-muted-foreground'
            }`}>
              {trend.growthRate > 0 ? '+' : ''}{trend.growthRate.toFixed(1)}%
            </span>
          </div>
          
          <div className="stat-card">
            <span className="stat-label">Volatility</span>
            <span className="stat-value text-sm">
              {trend.volatility < 20 ? 'Low' : trend.volatility < 40 ? 'Med' : 'High'}
            </span>
          </div>
          
          <div className="stat-card">
            <span className="stat-label">Confidence</span>
            <span className="stat-value text-sm text-primary">
              {trend.confidence}%
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Based on last 30 days download patterns
        </p>
      </div>
    </div>
  );
}
