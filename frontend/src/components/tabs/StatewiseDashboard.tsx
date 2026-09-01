import React, { useState } from 'react';
import type { StatewiseKPIs } from '../../types/dashboard';
import { KPICard } from '../common/KPICard';
import { ExportButton } from '../common/ExportButton';
import { 
  UserCheck, 
  Clock, 
  Briefcase, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

interface StatewiseDashboardProps {
  data: StatewiseKPIs | null;
  loading: boolean;
  onSelectEmployee: (empNumber: number) => void;
}

export const StatewiseDashboard: React.FC<StatewiseDashboardProps> = ({
  data,
  loading,
  onSelectEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('EMPLOYEE NUMBER');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  if (loading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Statewise Analytics...</span>
        </div>
      </div>
    );
  }

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 inline ml-1 opacity-70" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="w-2.5 h-2.5 text-cyan-600 inline ml-1" />
    ) : (
      <ArrowDown className="w-2.5 h-2.5 text-cyan-600 inline ml-1" />
    );
  };

  const filteredRoster = (data.employee_roster || []).filter((emp) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const id = String(emp['EMPLOYEE NUMBER'] || '').toLowerCase();
    const name = String(emp['EMPLOYEE LABEL'] || '').toLowerCase();
    return id.includes(term) || name.includes(term);
  });

  const sortedRoster = [...filteredRoster].sort((a, b) => {
    const av = a[sortField as keyof typeof a];
    const bv = b[sortField as keyof typeof b];
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'asc' ? av - bv : bv - av;
    }
    return sortDir === 'asc'
      ? String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true })
      : String(bv ?? '').localeCompare(String(av ?? ''), undefined, { numeric: true });
  });

  const totalPages = Math.ceil(sortedRoster.length / rowsPerPage) || 1;
  const paginatedRoster = sortedRoster.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex-1 flex flex-col gap-2 overflow-hidden select-none">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        <KPICard
          title="State Delivery Manager (SDM)"
          value={data.selected_sdm.split('(')[0].trim()}
          subtitle={data.selected_sdm}
          icon={ShieldCheck}
          badge="Executive Lead"
          badgeColor="cyan"
        />
        <KPICard
          title="Filtered Workforce"
          value={data.filtered_employees}
          subtitle="Active Employees in Selection"
          icon={UserCheck}
          badge="State Headcount"
          badgeColor="emerald"
        />
        <KPICard
          title="Avg Prior Experience"
          value={`${data.avg_prior_exp} Yrs`}
          subtitle="Non-ETS External Experience"
          icon={Briefcase}
          badge="Prior Exp"
          badgeColor="amber"
        />
        <KPICard
          title="Avg Infinite Experience"
          value={`${data.avg_infinite_exp} Yrs`}
          subtitle="Tenure at Infinite / ETS"
          icon={Clock}
          badge="ETS Tenure"
          badgeColor="purple"
        />
      </div>

      {/* Middle Visuals: 3 Charts */}
      <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
        {/* Chart 1: Experience Analysis by Job Level */}
        <div className="glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Experience Analysis by Job Level</span>
            <span className="text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 font-semibold">Prior vs ETS</span>
          </div>

          <div className="flex-1 min-h-0 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.experience_by_grade} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="job_level" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                <Bar dataKey="prior_exp" fill="#d97706" name="Prior Exp (Yrs)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="infinite_exp" fill="#0284c7" name="Infinite Exp (Yrs)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Employee Distribution by Job Level and Project */}
        <div className="glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Distribution by Job Level & Project</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">Grade x Project</span>
          </div>

          <div className="flex-1 min-h-0 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.project_grade_distribution.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="job_level" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[3, 3, 0, 0]} name="Headcount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Breakdown of Workforce by Geography and Job Level */}
        <div className="glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Workforce Geography & Grade</span>
            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 font-semibold">Grade x Location</span>
          </div>

          <div className="flex-1 min-h-0 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.geography_grade_breakdown.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="job_level" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Bar dataKey="count" fill="#7c3aed" radius={[3, 3, 0, 0]} name="Headcount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom: Filtered Employee Listing Table */}
      <div className="glass-panel rounded-xl p-2.5 shrink-0 h-48 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Employee Listing</span>
            <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono border border-slate-200 font-semibold">
              {filteredRoster.length} Records
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex items-center">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-[11px] pl-6 pr-6 py-0.5 rounded-md focus:outline-none focus:border-cyan-500 w-44 hover:border-slate-300 transition-colors leading-none"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3 h-3 text-slate-400 hover:text-rose-500" />
                </button>
              )}
            </div>

            <ExportButton data={sortedRoster} filename="statewise_employee_roster.csv" />
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span>Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 disabled:opacity-30"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar my-1">
          <table className="w-full text-left text-[11px] text-slate-700">
            <thead className="sticky top-0 bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 z-10">
              <tr>
                <th className="py-1 px-2 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('EMPLOYEE NUMBER')}>
                  <div className="flex items-center gap-0.5">ID <SortIcon field="EMPLOYEE NUMBER" /></div>
                </th>
                <th className="py-1 px-2 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('EMPLOYEE LABEL')}>
                  <div className="flex items-center gap-0.5">Employee Name <SortIcon field="EMPLOYEE LABEL" /></div>
                </th>
                <th className="py-1 px-2 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('JOB LEVEL')}>
                  <div className="flex items-center gap-0.5">Grade <SortIcon field="JOB LEVEL" /></div>
                </th>
                <th className="py-1 px-2 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('JOB TITLE')}>
                  <div className="flex items-center gap-0.5">Title <SortIcon field="JOB TITLE" /></div>
                </th>
                <th className="py-1 px-2 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('LOCATION')}>
                  <div className="flex items-center gap-0.5">Location <SortIcon field="LOCATION" /></div>
                </th>
                <th className="py-1 px-2 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('State')}>
                  <div className="flex items-center gap-0.5">State / Project <SortIcon field="State" /></div>
                </th>
                <th className="py-1 px-2 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('MANAGER')}>
                  <div className="flex items-center gap-0.5">Manager <SortIcon field="MANAGER" /></div>
                </th>
                <th className="py-1 px-2 text-right cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('Prior_Exp')}>
                  <div className="flex items-center justify-end gap-0.5">Prior Exp <SortIcon field="Prior_Exp" /></div>
                </th>
                <th className="py-1 px-2 text-right cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('Infinite_Exp')}>
                  <div className="flex items-center justify-end gap-0.5">ETS Exp <SortIcon field="Infinite_Exp" /></div>
                </th>
                <th className="py-1 px-2 text-right font-bold text-slate-900 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('Total_Exp')}>
                  <div className="flex items-center justify-end gap-0.5">Total Exp <SortIcon field="Total_Exp" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRoster.length > 0 ? (
                paginatedRoster.map((emp) => (
                  <tr 
                    key={emp['EMPLOYEE NUMBER']}
                    onClick={() => onSelectEmployee(emp['EMPLOYEE NUMBER'])}
                    className="hover:bg-slate-50/90 cursor-pointer transition-colors group"
                  >
                    <td className="py-1 px-2 font-mono text-cyan-700 font-semibold group-hover:underline">{emp['EMPLOYEE NUMBER']}</td>
                    <td className="py-1 px-2 font-medium text-slate-900">{emp['EMPLOYEE LABEL']}</td>
                    <td className="py-1 px-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {emp['JOB LEVEL']}
                      </span>
                    </td>
                    <td className="py-1 px-2 text-slate-600 truncate max-w-[120px]">{emp['JOB TITLE']}</td>
                    <td className="py-1 px-2">{emp['LOCATION']}</td>
                    <td className="py-1 px-2">{emp['State']} / {emp['Project Working']}</td>
                    <td className="py-1 px-2 text-slate-600 truncate max-w-[140px]">{emp['MANAGER']}</td>
                    <td className="py-1 px-2 text-right font-mono">{emp['Prior_Exp']} y</td>
                    <td className="py-1 px-2 text-right font-mono">{emp['Infinite_Exp']} y</td>
                    <td className="py-1 px-2 text-right font-mono font-bold text-slate-900">{emp['Total_Exp']} y</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-slate-400 text-xs">
                    No matching employees found for "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
