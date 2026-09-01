import React, { useState } from 'react';
import type { HomeKPIs } from '../../types/dashboard';
import {
  Users,
  Clock,
  Briefcase,
  Award,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Compass,
  Shield,
  LucideIcon,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface HomeDashboardProps {
  data: HomeKPIs | null;
  loading: boolean;
  onNavigateTab: (tab: string) => void;
}

/* ─── Color tokens ────────────────────────────────────────────── */
const HIRING_COLORS: Record<string, string> = {
  'Joined 2024': '#10b981',
  'Joined 2023': '#0284c7',
  'Joined Earlier': '#f59e0b',
};
const FALLBACK_HIRING = ['#10b981', '#0284c7', '#f59e0b'];

const LOCATION_COLORS: Record<string, string> = {
  Bangalore: '#0284c7',
  Hyderabad: '#0d9488',
  Chennai: '#f97316',
  Pune: '#8b5cf6',
};

const LOCATION_TINTS: Record<string, string> = {
  Bangalore: 'bg-sky-50 border-sky-200 text-sky-800',
  Hyderabad: 'bg-teal-50 border-teal-200 text-teal-800',
  Chennai: 'bg-orange-50 border-orange-200 text-orange-800',
  Pune: 'bg-purple-50 border-purple-200 text-purple-800',
};

/* Accent palette shared across all 6 KPI slots */
type Accent = 'teal' | 'blue' | 'pink' | 'emerald' | 'amber' | 'purple';

const ACCENT: Record<Accent, {
  icon: string;    // icon bg+text+border
  badge: string;   // badge bg+text+border
  ring: string;    // progress ring stroke
  track: string;   // progress ring track
  shield: string;  // shield icon color
}> = {
  teal: {
    icon:   'bg-teal-50 text-teal-600 border border-teal-100',
    badge:  'bg-teal-50 text-teal-700 border-teal-200',
    ring:   '#0d9488',
    track:  '#ccfbf1',
    shield: 'text-teal-600',
  },
  blue: {
    icon:   'bg-blue-50 text-blue-600 border border-blue-100',
    badge:  'bg-blue-50 text-blue-700 border-blue-200',
    ring:   '#2563eb',
    track:  '#dbeafe',
    shield: 'text-blue-600',
  },
  pink: {
    icon:   'bg-pink-50 text-pink-600 border border-pink-100',
    badge:  'bg-pink-50 text-pink-700 border-pink-200',
    ring:   '#db2777',
    track:  '#fce7f3',
    shield: 'text-pink-600',
  },
  emerald: {
    icon:   'bg-emerald-50 text-emerald-600 border border-emerald-100',
    badge:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    ring:   '#059669',
    track:  '#d1fae5',
    shield: 'text-emerald-600',
  },
  amber: {
    icon:   'bg-amber-50 text-amber-600 border border-amber-100',
    badge:  'bg-amber-50 text-amber-700 border-amber-200',
    ring:   '#d97706',
    track:  '#fef3c7',
    shield: 'text-amber-600',
  },
  purple: {
    icon:   'bg-purple-50 text-purple-600 border border-purple-100',
    badge:  'bg-purple-50 text-purple-700 border-purple-200',
    ring:   '#7c3aed',
    track:  '#ede9fe',
    shield: 'text-purple-600',
  },
};

/* ─── Executive avatar SVGs ───────────────────────────────────── */
const MaleSVG = ({ cls = 'w-3.5 h-3.5' }: { cls?: string }) => (
  <svg viewBox="0 0 36 36" fill="none" className={cls}>
    <path
      d="M18 4C13.5 4 11 6.5 11 10C11 11.5 11.5 13 12.5 14C12.2 15 12 16.2 12 17.5C12 21 14.5 23 18 23C21.5 23 24 21 24 17.5C24 16.2 23.8 15 23.5 14C24.5 13 25 11.5 25 10C25 6.5 22.5 4 18 4Z"
      fill="currentColor"
    />
    <rect x="13.2" y="14" width="4.2" height="2.8" rx="0.8" fill="#fff" />
    <rect x="18.6" y="14" width="4.2" height="2.8" rx="0.8" fill="#fff" />
    <path d="M17.4 15.4H18.6" stroke="#fff" strokeWidth="1" />
    <path d="M9 31C9 26 13 24 18 24C23 24 27 26 27 31V32H9V31Z" fill="currentColor" />
    <path d="M16.5 24L18 28.5L19.5 24H16.5Z" fill="#fff" />
    <path d="M17.2 28.5L18 32.5L18.8 28.5H17.2Z" fill="#fff" />
  </svg>
);

const FemaleSVG = ({ cls = 'w-3.5 h-3.5' }: { cls?: string }) => (
  <svg viewBox="0 0 36 36" fill="none" className={cls}>
    <path
      d="M18 4C13 4 10 7 10 12C10 16.5 11.2 19.5 12 21C13 21.8 14.5 22 18 22C21.5 22 23 21.8 24 21C24.8 19.5 26 16.5 26 12C26 7 23 4 18 4Z"
      fill="currentColor"
    />
    <path
      d="M14 11C14 8.8 15.8 7 18 7C20.2 7 22 8.8 22 11C22 14.5 20.5 17 18 17C15.5 17 14 14.5 14 11Z"
      fill="#fff"
    />
    <path
      d="M9 31C9 25.5 13 23.5 18 23.5C23 23.5 27 25.5 27 31V32H9V31Z"
      fill="currentColor"
    />
    <path d="M15.5 23.5L18 27.5L20.5 23.5H15.5Z" fill="#fff" />
  </svg>
);

/* ─── Unified KPI Card ────────────────────────────────────────── */
interface KPISlotProps {
  accent: Accent;
  title: string;
  value: string | number;
  badge: string;
  subtitle: string;
  /** 0–100 — if provided, a circular progress ring + shield + trend row appear */
  pct?: number;
  trend?: string;
  /** Custom icon node (use for male/female avatars) */
  iconNode?: React.ReactNode;
  /** Lucide icon component (use for the other four cards) */
  Icon?: LucideIcon;
}

const RING_R = 26;
const RING_C = 2 * Math.PI * RING_R; // ≈ 163.4

const KPISlot: React.FC<KPISlotProps> = ({
  accent,
  title,
  value,
  badge,
  subtitle,
  pct,
  trend,
  iconNode,
  Icon,
}) => {
  const a = ACCENT[accent];
  const hasRing = pct !== undefined;

  return (
    /* Every slot: full height of the row, identical padding/border */
    <div className="glass-panel rounded-xl p-2.5 flex flex-col justify-between h-full">

      {/* ── Row 1: title left | icon right ── */}
      <div className="flex items-center justify-between gap-1 shrink-0">
        <span className="text-[11px] font-semibold text-slate-600 truncate leading-tight">
          {title}
        </span>
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${a.icon}`}>
          {iconNode
            ? iconNode
            : Icon
            ? <Icon className="w-3.5 h-3.5" />
            : null}
        </div>
      </div>

      {/* ── Row 2: value + ring (for male/female) or value alone ── */}
      {hasRing ? (
        <div className="flex items-center justify-between gap-1 my-1 min-h-0">
          {/* Left column: big value + badge + label */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight leading-none">
                {value}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0 rounded border font-mono leading-tight shrink-0 ${a.badge}`}
              >
                {badge}
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-medium mt-0.5 leading-tight truncate">
              of Total Workforce
            </p>
          </div>

          {/* Right column: circular ring */}
          <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r={RING_R} stroke={a.track} strokeWidth="5" fill="transparent" />
              <circle
                cx="32" cy="32" r={RING_R}
                stroke={a.ring}
                strokeWidth="5"
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C - (pct / 100) * RING_C}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-500"
              />
            </svg>
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ color: a.ring }}
            >
              {iconNode
                ? React.cloneElement(iconNode as React.ReactElement<{ cls?: string }>, { cls: 'w-6 h-6' })
                : null}
            </div>
          </div>
        </div>
      ) : (
        /* Standard 4-card layout: value + badge in a row */
        <div className="my-1 flex items-baseline justify-between gap-1 shrink-0">
          <span className="text-xl font-extrabold text-slate-900 font-mono tracking-tight leading-none">
            {value}
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0 rounded border font-mono shrink-0 ${a.badge}`}>
            {badge}
          </span>
        </div>
      )}

      {/* ── Row 3: divider + bottom info ── */}
      <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 text-[10px] shrink-0">
        {hasRing ? (
          /* Gender cards: shield % + trend */
          <>
            <div className="flex items-center gap-1 min-w-0">
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${a.icon}`}
              >
                <Shield className="w-3 h-3" />
              </div>
              <div className="min-w-0">
                <p className={`font-bold font-mono leading-none ${a.shield.replace('text-', 'text-')}`}
                   style={{ color: a.ring }}>
                  {badge}
                </p>
                <p className="text-[9px] text-slate-400 leading-none mt-0.5 truncate">
                  Diversity Ratio
                </p>
              </div>
            </div>
            {trend && (
              <div className="flex items-center gap-0.5 shrink-0">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <div>
                  <p className="font-bold text-emerald-600 font-mono leading-none">{trend}</p>
                  <p className="text-[9px] text-slate-400 leading-none mt-0.5">vs Last Month</p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Standard 4 cards: just the subtitle */
          <span className="truncate text-slate-500 font-medium">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

/* ─── Main Dashboard ──────────────────────────────────────────── */
export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  data,
  loading,
  onNavigateTab,
}) => {
  const [hoveredLocIndex, setHoveredLocIndex] = useState<number | null>(null);

  if (loading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading ETS Executive Dashboard...</span>
        </div>
      </div>
    );
  }

  const hiringData = Object.entries(data.recent_hirings).map(([k, v]) => ({
    name: k,
    value: v,
    color: HIRING_COLORS[k] ?? FALLBACK_HIRING[0],
  }));

  const rankedLocs = [...data.location_distribution]
    .sort((a, b) => b.count - a.count)
    .map((l) => ({ ...l, color: LOCATION_COLORS[l.location] ?? '#0284c7' }));

  const activeHovered = hoveredLocIndex !== null ? rankedLocs[hoveredLocIndex] : null;

  return (
    <div className="flex-1 flex flex-col gap-2 overflow-hidden select-none">

      {/* ══ ROW 1: 6 equal-height KPI cards ══ */}
      <div className="grid grid-cols-6 gap-2 shrink-0" style={{ gridAutoRows: '1fr' }}>

        {/* 1 – Total Employees */}
        <KPISlot
          accent="teal"
          title="Total Employees"
          value={data.total_employees}
          badge="Headcount"
          subtitle="Registered Active Workforce"
          Icon={Users}
        />

        {/* 2 – Male Workforce  */}
        <KPISlot
          accent="blue"
          title="Male Workforce"
          value={data.male_count}
          badge={`${data.pct_male}%`}
          subtitle="of Total Workforce"
          pct={data.pct_male}
          trend="+2.45%"
          iconNode={<MaleSVG cls="w-3.5 h-3.5" />}
        />

        {/* 3 – Female Workforce */}
        <KPISlot
          accent="pink"
          title="Female Workforce"
          value={data.female_count}
          badge={`${data.pct_female}%`}
          subtitle="of Total Workforce"
          pct={data.pct_female}
          trend="+1.32%"
          iconNode={<FemaleSVG cls="w-3.5 h-3.5" />}
        />

        {/* 4 – Avg ETS Experience */}
        <KPISlot
          accent="emerald"
          title="Avg ETS Experience"
          value={`${data.avg_infinite_exp} Yrs`}
          badge="Tenure"
          subtitle="Tenure within Organization"
          Icon={Clock}
        />

        {/* 5 – Avg Non-ETS Exp */}
        <KPISlot
          accent="amber"
          title="Avg Non-ETS Exp"
          value={`${data.avg_prior_exp} Yrs`}
          badge="Prior"
          subtitle="Prior External Industry Exp"
          Icon={Briefcase}
        />

        {/* 6 – Avg Total Experience */}
        <KPISlot
          accent="purple"
          title="Avg Total Experience"
          value={`${data.avg_total_exp} Yrs`}
          badge="Total"
          subtitle="Cumulative Career Length"
          Icon={Award}
        />
      </div>

      {/* ══ ROW 2: 3-column chart area ══ */}
      <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">

        {/* Recent Hirings Donut */}
        <div className="col-span-3 glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Recent Hirings</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
              Cohort Split
            </span>
          </div>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={hiringData} cx="50%" cy="50%" innerRadius="50%" outerRadius="74%"
                  paddingAngle={3} dataKey="value">
                  {hiringData.map((e, i) => (
                    <Cell key={i} fill={e.color} stroke="#fff" strokeWidth={1.5} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-sm font-bold text-slate-900 font-mono">
                {(data.recent_hirings['Joined 2023'] ?? 0) + (data.recent_hirings['Joined 2024'] ?? 0)}
              </span>
              <span className="text-[9px] text-slate-500 font-medium">Recent (23/24)</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100 shrink-0 text-center">
            {hiringData.map((h) => (
              <div key={h.name} className="p-1 rounded bg-slate-50 border border-slate-200/80">
                <p className="text-[9px] text-slate-500 font-medium truncate">{h.name}</p>
                <p className="text-[11px] font-bold font-mono" style={{ color: h.color }}>{h.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Attrition Rate Bar Chart */}
        <div className="col-span-5 glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-xs font-bold text-slate-800 tracking-tight">Attrition Rate by Year</span>
            </div>
            <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-semibold">
              Historical Trend
            </span>
          </div>
          <div className="flex-1 min-h-0 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.attrition_by_year} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.1)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Bar dataKey="exits" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Exits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workforce by Location – Interactive Radial */}
        <div className="col-span-4 glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-xs font-bold text-slate-800 tracking-tight">Workforce by Location</span>
            </div>
            <span className="text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 font-semibold">
              Radial Distribution
            </span>
          </div>

          <div className="flex-1 min-h-0 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rankedLocs} cx="50%" cy="50%"
                  innerRadius="50%" outerRadius="75%"
                  paddingAngle={3} dataKey="count"
                  onMouseEnter={(_, i) => setHoveredLocIndex(i)}
                  onMouseLeave={() => setHoveredLocIndex(null)}
                >
                  {rankedLocs.map((e, i) => (
                    <Cell
                      key={i} fill={e.color}
                      stroke={hoveredLocIndex === i ? '#0f172a' : '#fff'}
                      strokeWidth={hoveredLocIndex === i ? 2.5 : 1.5}
                      className="cursor-pointer"
                      style={{ filter: hoveredLocIndex === i ? 'drop-shadow(0 2px 6px rgba(0,0,0,.15))' : 'none' }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.1)' }}
                  formatter={(v: any, _: any, p: any) => [
                    `${v} Employees (${p.payload.percentage}%)`, p.payload.location,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {activeHovered ? (
                <>
                  <span className="text-xs font-bold truncate max-w-[80px]" style={{ color: activeHovered.color }}>
                    {activeHovered.location}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">{activeHovered.count}</span>
                  <span className="text-[9px] text-slate-500 font-semibold font-mono">{activeHovered.percentage}%</span>
                </>
              ) : (
                <>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">{data.total_employees}</span>
                  <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Total Emps</span>
                  <span className="text-[8px] text-slate-400">4 Hubs</span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-100 shrink-0">
            {rankedLocs.map((loc, i) => {
              const hov = hoveredLocIndex === i;
              return (
                <div
                  key={loc.location}
                  onMouseEnter={() => setHoveredLocIndex(i)}
                  onMouseLeave={() => setHoveredLocIndex(null)}
                  className={`p-1 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-1 text-[10px] ${
                    hov ? `${LOCATION_TINTS[loc.location]} shadow-xs` : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <span
                      className="text-[9px] font-extrabold px-1 rounded font-mono shrink-0"
                      style={{ backgroundColor: `${loc.color}18`, color: loc.color }}
                    >
                      #{i + 1}
                    </span>
                    <span className="font-bold text-slate-800 truncate">{loc.location}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 font-mono">{loc.count}</span>
                    <span className="text-[9px] text-slate-500 font-mono ml-0.5">({loc.percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ ROW 3: Quick Jump Cards ══ */}
      <div className="grid grid-cols-6 gap-2 shrink-0 h-16">
        {[
          { tab: 'statewise',        mod: 2, label: 'Statewise Dashboard',        sub: 'Geography & Project Matrix',    color: 'cyan'   },
          { tab: 'techwise',         mod: 3, label: 'Tech Wise Dashboard',         sub: 'Skills & Competency Grid',      color: 'teal'   },
          { tab: 'salarywise',       mod: 4, label: 'Salary Wise Dashboard',       sub: 'Compensation Tiers & Earners',  color: 'amber'  },
          { tab: 'salarywise2',      mod: 5, label: 'Salary 2 Wise Dashboard',     sub: 'Promotion & Progression Trends', color: 'emerald'},
          { tab: 'calendar',         mod: 6, label: 'Employee Calendar',          sub: 'Attendance & Leave Schedules',  color: 'purple' },
          { tab: 'employee_details', mod: 7, label: 'ETS Employee Details',        sub: '360° Profile & Experience',     color: 'blue'   },
        ].map(({ tab, mod, label, sub, color }) => (
          <button
            key={tab}
            onClick={() => onNavigateTab(tab)}
            className={`glass-card rounded-xl p-2 flex items-center justify-between text-left hover:border-${color}-400 transition-all group`}
          >
            <div className="min-w-0 pr-1">
              <span className={`text-[10px] text-${color}-700 font-bold uppercase tracking-wider block leading-tight`}>
                Module {mod}
              </span>
              <span className={`text-xs font-bold text-slate-900 group-hover:text-${color}-700 block truncate`}>
                {label}
              </span>
              <p className="text-[9px] text-slate-500 truncate">{sub}</p>
            </div>
            <ArrowRight className={`w-4 h-4 text-slate-400 group-hover:text-${color}-600 group-hover:translate-x-1 transition-all shrink-0`} />
          </button>
        ))}
      </div>
    </div>
  );
};
