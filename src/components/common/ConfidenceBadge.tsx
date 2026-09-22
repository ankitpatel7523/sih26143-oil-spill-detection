import React from 'react';

interface ConfidenceBadgeProps {
  score: number; // 0 to 100 or 0 to 1
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true
}) => {
  const percentage = score > 1 ? score : Math.round(score * 100);

  let colorClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  let level = 'High Confidence';

  if (percentage < 50) {
    colorClasses = 'bg-slate-500/20 text-slate-400 border-slate-600/30';
    level = 'Low';
  } else if (percentage < 75) {
    colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    level = 'Moderate';
  } else if (percentage >= 90) {
    colorClasses = 'bg-red-500/20 text-rose-300 border-red-500/40 animate-pulse';
    level = 'Critical Suspect';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border ${sizeClasses} ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{percentage.toFixed(1)}%</span>
      {showLabel && <span className="opacity-80 text-[10px] uppercase font-sans">({level})</span>}
    </span>
  );
};
