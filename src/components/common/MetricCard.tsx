import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: "blue" | "amber" | "emerald" | "rose" | "purple";
  subtext?: string;
  onClick?: () => void;
}

const colorMap = {
  blue: "from-blue-500/15 to-cyan-500/5 text-cyan-400 border-cyan-500/30",
  amber: "from-amber-500/15 to-orange-500/5 text-amber-400 border-amber-500/30",
  emerald: "from-emerald-500/15 to-teal-500/5 text-emerald-400 border-emerald-500/30",
  rose: "from-rose-500/15 to-red-500/5 text-rose-400 border-rose-500/30",
  purple: "from-purple-500/15 to-indigo-500/5 text-purple-400 border-purple-500/30"
};

const iconBgMap = {
  blue: "bg-cyan-500/20 text-cyan-300",
  amber: "bg-amber-500/20 text-amber-300",
  emerald: "bg-emerald-500/20 text-emerald-300",
  rose: "bg-rose-500/20 text-rose-300",
  purple: "bg-purple-500/20 text-purple-300"
};

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  color = "blue",
  subtext,
  onClick
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 shadow-lg backdrop-blur-md transition-all duration-200 ${
        colorMap[color]
      } ${onClick ? 'cursor-pointer hover:border-cyan-400/60 hover:scale-[1.01]' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white font-mono">
            {value}
          </p>
          {change && (
            <div className="mt-1.5 flex items-center space-x-1.5 text-xs">
              <span
                className={`font-semibold ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {change}
              </span>
              <span className="text-slate-400">vs past 30 days</span>
            </div>
          )}
          {subtext && !change && (
            <p className="mt-1 text-xs text-slate-400">{subtext}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconBgMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/5 blur-xl pointer-events-none" />
    </div>
  );
};
