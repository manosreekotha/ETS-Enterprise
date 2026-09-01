import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'cyan' | 'emerald' | 'amber' | 'purple' | 'rose' | 'blue';
  trend?: string;
  onClick?: () => void;
}

const BADGE_STYLES = {
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
};

const ICON_BG_STYLES = {
  cyan: 'bg-cyan-50 text-cyan-600 border border-cyan-100',
  emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  amber: 'bg-amber-50 text-amber-600 border border-amber-100',
  purple: 'bg-purple-50 text-purple-600 border border-purple-100',
  rose: 'bg-rose-50 text-rose-600 border border-rose-100',
  blue: 'bg-blue-50 text-blue-600 border border-blue-100',
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'cyan',
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-xl p-2.5 flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-cyan-400 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-semibold text-slate-600 truncate">{title}</span>
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${ICON_BG_STYLES[badgeColor]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="my-1 flex items-baseline justify-between gap-2">
        <span className="text-lg font-bold text-slate-900 tracking-tight font-mono">{value}</span>
        {badge && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border font-mono ${BADGE_STYLES[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100">
          <span className="truncate">{subtitle}</span>
          {trend && <span className="text-emerald-600 font-bold font-mono shrink-0">{trend}</span>}
        </div>
      )}
    </div>
  );
};
