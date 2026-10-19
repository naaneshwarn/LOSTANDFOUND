import React from 'react';
import { cn } from '../../lib/utils';
import { Sparkles, Info } from 'lucide-react';

export const MatchScoreIndicator: React.FC<{
  scorePercentage: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ scorePercentage, showDetails = true, size = 'md' }) => {
  let colorClass = 'text-brand-600 bg-brand-50 border-brand-200';
  let barColor = 'bg-brand-600';
  let tierLabel = 'Candidate Match';

  if (scorePercentage >= 85) {
    colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    barColor = 'bg-emerald-600';
    tierLabel = 'High Visual Match';
  } else if (scorePercentage >= 65) {
    colorClass = 'text-blue-700 bg-blue-50 border-blue-200';
    barColor = 'bg-blue-600';
    tierLabel = 'Moderate Match';
  } else if (scorePercentage >= 50) {
    colorClass = 'text-amber-700 bg-amber-50 border-amber-200';
    barColor = 'bg-amber-500';
    tierLabel = 'Potential Candidate';
  } else {
    colorClass = 'text-slate-600 bg-slate-100 border-slate-200';
    barColor = 'bg-slate-500';
    tierLabel = 'Low Visual Match';
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-brand-500 shrink-0" />
          <span className="text-xs font-bold text-navy-900">{tierLabel}</span>
        </div>
        <span
          className={cn(
            'font-mono font-extrabold px-2 py-0.5 rounded-md border text-xs',
            colorClass
          )}
        >
          {scorePercentage}%
        </span>
      </div>

      {/* Progress Track */}
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barColor)}
          style={{ width: `${Math.min(100, Math.max(5, scorePercentage))}%` }}
        />
      </div>

      {showDetails && (
        <p className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
          <Info className="h-3 w-3 shrink-0" />
          <span>Visual candidate similarity — not a guaranteed identity.</span>
        </p>
      )}
    </div>
  );
};
