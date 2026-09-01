import React, { useMemo, useState } from 'react';
import type { Salarywise2KPIs } from '../../types/dashboard';
import { ExportButton } from '../common/ExportButton';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart,
} from 'recharts';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, X, Users, Filter } from 'lucide-react';

interface Salarywise2DashboardProps {
  data: Salarywise2KPIs | null;
  loading: boolean;
  onSelectEmployee: (empNumber: number) => void;
}

type SortField = 'Total_CTC' | 'M_Salary' | 'EMPLOYEE LABEL';
type SortDir = 'asc' | 'desc';

const TS = {
  contentStyle: { backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  itemStyle: { color: '#0f172a' },
};

export const Salarywise2Dashboard: React.FC<Salarywise2DashboardProps> = ({ data, loading, onSelectEmployee }) => {
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterGrade, setRosterGrade] = useState('');
  const [rosterLocation, setRosterLocation] = useState('');
  const [rosterDept, setRosterDept] = useState('');
  const [sortField, setSortField] = useState<SortField>('Total_CTC');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  // ── All hooks MUST come before any early return (Rules of Hooks) ──
  const earners = data?.top_earners ?? [];

  const uniqueGrades    = useMemo(() => [...new Set(earners.map(e => e['JOB LEVEL']))].sort(), [earners]);
  const uniqueLocations = useMemo(() => [...new Set(earners.map(e => e['LOCATION']))].sort(), [earners]);
  const uniqueDepts     = useMemo(() => [...new Set(earners.map(e => e['DEPARTMENT']))].sort(), [earners]);

  const filteredRoster = useMemo(() => {
    let rows = [...earners];
    if (rosterSearch.trim()) {
      const q = rosterSearch.toLowerCase();
      rows = rows.filter(e => e['EMPLOYEE LABEL'].toLowerCase().includes(q));
    }
    if (rosterGrade)    rows = rows.filter(e => e['JOB LEVEL'] === rosterGrade);
    if (rosterLocation) rows = rows.filter(e => e['LOCATION'] === rosterLocation);
    if (rosterDept)     rows = rows.filter(e => e['DEPARTMENT'] === rosterDept);
    rows.sort((a, b) => {
      const av = a[sortField] as string | number;
      const bv = b[sortField] as string | number;
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [earners, rosterSearch, rosterGrade, rosterLocation, rosterDept, sortField, sortDir]);

  if (loading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading Advanced Salary &amp; Promotion Analytics...</span>
        </div>
      </div>
    );
  }


  const totalPages = Math.max(1, Math.ceil(filteredRoster.length / PAGE_SIZE));
  const paginatedRoster = filteredRoster.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  };
  const clearFilters = () => { setRosterSearch(''); setRosterGrade(''); setRosterLocation(''); setRosterDept(''); setPage(1); };
  const hasFilter = !!(rosterSearch || rosterGrade || rosterLocation || rosterDept);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400 inline ml-0.5" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3 h-3 text-cyan-600 inline ml-0.5" />
      : <ArrowDown className="w-3 h-3 text-cyan-600 inline ml-0.5" />;
  };

  return (
    <div className="flex-1 flex flex-col gap-2 overflow-hidden select-none">

      {/* Filtered employees badge */}
      <div className="shrink-0 flex items-center gap-2 text-[11px] px-2 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 font-semibold w-fit">
        <Users className="w-3.5 h-3.5" />
        <span>Analytics for <span className="font-mono">{data.filtered_count ?? data.top_earners.length}</span> matched records</span>
      </div>

      {/* Row 1: Charts */}
      <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
        <div className="col-span-4 glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Average Salary by Team</span>
            <span className="text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 font-semibold">Base vs CTC</span>
          </div>
          <div className="flex-1 min-h-0 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.team_avg_salary} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="department" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `₹${(v/100000).toFixed(0)}L`} />
                <Tooltip {...TS} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '2px' }} />
                <Bar dataKey="avg_salary" fill="#0284c7" name="Avg Base" radius={[3,3,0,0]} />
                <Bar dataKey="avg_ctc" fill="#10b981" name="Avg CTC" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-4 glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Salary Trend Over Years</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">2020 - 2024</span>
          </div>
          <div className="flex-1 min-h-0 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salary_trend_years} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `₹${(v/100000).toFixed(0)}L`} />
                <Tooltip {...TS} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '2px' }} />
                <Line type="monotone" dataKey="avg_salary" stroke="#0284c7" strokeWidth={2} name="Avg Base" />
                <Line type="monotone" dataKey="avg_ctc" stroke="#10b981" strokeWidth={2} name="Avg CTC" />
                <Line type="monotone" dataKey="avg_bonus" stroke="#f59e0b" strokeWidth={2} name="Avg Bonus" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-4 glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Hike Analysis · Pre vs Post Promotion</span>
            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 font-semibold">Promotion %</span>
          </div>
          <div className="flex-1 min-h-0 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.hike_analysis_promotion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip {...TS} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '2px' }} />
                <Bar dataKey="headcount" fill="#8b5cf6" name="Headcount" radius={[3,3,0,0]} />
                <Line type="monotone" dataKey="avg_hike_pct" stroke="#ec4899" strokeWidth={2} name="Avg Hike %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
        <div className="col-span-4 glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Component-wise Compensation per Band</span>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">Stacked Area</span>
          </div>
          <div className="flex-1 min-h-0 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.compensation_by_band} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="salary_bin" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v: number) => `₹${(v/100000).toFixed(0)}L`} />
                <Tooltip {...TS} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '2px' }} />
                <Area type="monotone" dataKey="avg_base" stackId="1" stroke="#0284c7" fill="#0284c7" name="Base" />
                <Area type="monotone" dataKey="avg_bonus" stackId="1" stroke="#10b981" fill="#10b981" name="Bonus" />
                <Area type="monotone" dataKey="avg_perks" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Perks" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-4 glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Monthly Salary Distribution Overview</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">Bands</span>
          </div>
          <div className="flex-1 min-h-0 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly_salary_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="salary_bin" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip {...TS} />
                <Bar dataKey="count" fill="#10b981" radius={[3,3,0,0]} name="Headcount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Compensation Roster */}
        <div className="col-span-4 glass-panel rounded-xl p-2.5 flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 tracking-tight">Top Compensation Roster</span>
              <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1 rounded border border-slate-200">{filteredRoster.length}</span>
            </div>
            <div className="flex items-center gap-1">
              {hasFilter && (
                <button onClick={clearFilters} className="flex items-center gap-0.5 text-[9px] text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded hover:bg-rose-100 transition-colors">
                  <X className="w-2.5 h-2.5" /> Clear
                </button>
              )}
              <ExportButton data={filteredRoster} filename="salarywise2_top_earners.csv" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 shrink-0">
            <div className="relative col-span-2">
              <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input type="text" placeholder="Search employee…" value={rosterSearch}
                onChange={e => { setRosterSearch(e.target.value); setPage(1); }}
                className="w-full pl-6 pr-6 py-1 text-[10px] bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-400" />
              {rosterSearch && (
                <button onClick={() => { setRosterSearch(''); setPage(1); }} className="absolute right-1.5 top-1/2 -translate-y-1/2">
                  <X className="w-3 h-3 text-slate-400 hover:text-rose-500" />
                </button>
              )}
            </div>
            <select value={rosterGrade} onChange={e => { setRosterGrade(e.target.value); setPage(1); }}
              className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700 focus:outline-none focus:border-cyan-400">
              <option value="">All Grades</option>
              {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={rosterLocation} onChange={e => { setRosterLocation(e.target.value); setPage(1); }}
              className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700 focus:outline-none focus:border-cyan-400">
              <option value="">All Locations</option>
              {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={rosterDept} onChange={e => { setRosterDept(e.target.value); setPage(1); }}
              className="col-span-2 text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700 focus:outline-none focus:border-cyan-400">
              <option value="">All Departments</option>
              {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-[11px] text-slate-700">
              <thead className="sticky top-0 bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 z-10">
                <tr>
                  <th className="py-1 px-1.5">
                    <button onClick={() => toggleSort('EMPLOYEE LABEL')} className="flex items-center gap-0.5 hover:text-cyan-700">Employee <SortIcon field="EMPLOYEE LABEL" /></button>
                  </th>
                  <th className="py-1 px-1.5">Grade</th>
                  <th className="py-1 px-1.5 text-right">
                    <button onClick={() => toggleSort('Total_CTC')} className="flex items-center gap-0.5 ml-auto hover:text-cyan-700">Total CTC <SortIcon field="Total_CTC" /></button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {paginatedRoster.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-4 text-slate-400 text-[11px] font-sans">
                    <Filter className="w-4 h-4 mx-auto mb-1 text-slate-300" />
                    No matching records
                  </td></tr>
                ) : paginatedRoster.map(e => (
                  <tr key={e['EMPLOYEE NUMBER']} onClick={() => onSelectEmployee(e['EMPLOYEE NUMBER'])} className="hover:bg-slate-50/90 cursor-pointer transition-colors">
                    <td className="py-1 px-1.5 font-sans font-medium text-slate-900 truncate max-w-[120px]">{e['EMPLOYEE LABEL']}</td>
                    <td className="py-1 px-1.5 font-sans">{e['JOB LEVEL']}</td>
                    <td className="py-1 px-1.5 text-right font-bold text-emerald-700">₹{e['Total_CTC'].toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 shrink-0 text-[10px]">
              <span className="text-slate-500 font-mono">{page}/{totalPages} · {filteredRoster.length} rows</span>
              <div className="flex gap-1">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 disabled:opacity-40 hover:bg-slate-100 transition-colors">‹ Prev</button>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 disabled:opacity-40 hover:bg-slate-100 transition-colors">Next ›</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
