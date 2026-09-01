import React, { useState } from 'react';
import type { TechwiseKPIs } from '../../types/dashboard';
import { KPICard } from '../common/KPICard';
import { ExportButton } from '../common/ExportButton';
import { 
  Cpu, 
  Award, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Grid,
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

interface TechwiseDashboardProps {
  data: TechwiseKPIs | null;
  loading: boolean;
  onSelectEmployee: (empNumber: number) => void;
}

export const TechwiseDashboard: React.FC<TechwiseDashboardProps> = ({
  data,
  loading,
  onSelectEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('employee_number');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  if (loading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Techwise Skills Analytics...</span>
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

  const filteredRoster = (data.skill_roster || []).filter((emp) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const id = String(emp.employee_number || '').toLowerCase();
    const name = String(emp.name || '').toLowerCase();
    return id.includes(term) || name.includes(term);
  });

  const sortedRoster = [...filteredRoster].sort((a, b) => {
    let av: any = a[sortField as keyof typeof a];
    let bv: any = b[sortField as keyof typeof b];
    if (sortField === 'skills') {
      av = (a.skills || []).length;
      bv = (b.skills || []).length;
    }
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
      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
        <KPICard
          title="Total Unique Skills Tracked"
          value={data.total_unique_skills}
          subtitle="Distinct Technology Capabilities"
          icon={Cpu}
          badge="Skill Catalog"
          badgeColor="cyan"
        />
        <KPICard
          title="Most Common Skill"
          value={data.most_common_skill}
          subtitle="Highest Capability Concentration"
          icon={Award}
          badge="Core Competency"
          badgeColor="emerald"
        />
        <KPICard
          title="Employees Missing Recorded Skills"
          value={data.missing_skills_count}
          subtitle="Pending Skill Profiling"
          icon={AlertCircle}
          badge="Inventory Gap"
          badgeColor="amber"
        />
      </div>

      {/* Middle Visuals: Skill Chart & Manager x Grade Matrix */}
      <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
        {/* Left: Employee Count by Skill */}
        <div className="col-span-6 glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Employee Count by Technical Skill</span>
            <span className="text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 font-semibold">Proficiency Breakdown</span>
          </div>

          <div className="flex-1 min-h-0 pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.skill_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="skill_name" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '2px' }} />
                <Bar dataKey="advanced_count" fill="#10b981" name="Advanced" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="intermediate_count" fill="#0284c7" name="Intermediate" stackId="a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Employee Strength by Reporting Manager & Grade (Pivot Matrix) */}
        <div className="col-span-6 glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-xs font-bold text-slate-800 tracking-tight">Employee Strength by Reporting Manager & Grade</span>
            </div>
            <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-semibold">Pivot Heatmap</span>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar my-1">
            <table className="w-full text-left text-[10px] text-slate-700">
              <thead className="sticky top-0 bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 z-10">
                <tr>
                  <th className="py-1 px-2">Reporting Manager</th>
                  {data.manager_grade_matrix.grades.map((g) => (
                    <th key={g} className="py-1 px-1.5 text-center">{g}</th>
                  ))}
                  <th className="py-1 px-2 text-right font-bold text-slate-900">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {data.manager_grade_matrix.managers.map((mgr) => {
                  const row = data.manager_grade_matrix.matrix[mgr] || {};
                  const rowTotal = Object.values(row).reduce((a, b) => a + b, 0);
                  return (
                    <tr key={mgr} className="hover:bg-slate-50/80">
                      <td className="py-1 px-2 font-sans text-slate-900 font-medium truncate max-w-[140px]">{mgr}</td>
                      {data.manager_grade_matrix.grades.map((g) => {
                        const count = row[g] || 0;
                        return (
                          <td 
                            key={g} 
                            className={`py-1 px-1.5 text-center font-bold ${
                              count > 5 ? 'bg-cyan-50 text-cyan-800' : count > 0 ? 'text-slate-800' : 'text-slate-400'
                            }`}
                          >
                            {count || '-'}
                          </td>
                        );
                      })}
                      <td className="py-1 px-2 text-right font-bold text-cyan-700">{rowTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom: Skill Inventory Listing */}
      <div className="glass-panel rounded-xl p-2.5 shrink-0 h-44 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Employee Skill Inventory Roster</span>
            <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono border border-slate-200 font-semibold">
              {filteredRoster.length} Mappings
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

            <ExportButton data={sortedRoster} filename="skill_inventory_roster.csv" />
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
                <th className="py-1 px-2 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('employee_number')}>
                  <div className="flex items-center gap-0.5">ID <SortIcon field="employee_number" /></div>
                </th>
                <th className="py-1 px-2 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-0.5">Employee Name <SortIcon field="name" /></div>
                </th>
                <th className="py-1 px-2 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('job_level')}>
                  <div className="flex items-center gap-0.5">Grade <SortIcon field="job_level" /></div>
                </th>
                <th className="py-1 px-2 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('location')}>
                  <div className="flex items-center gap-0.5">Location <SortIcon field="location" /></div>
                </th>
                <th className="py-1 px-2 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('manager')}>
                  <div className="flex items-center gap-0.5">Reporting Manager <SortIcon field="manager" /></div>
                </th>
                <th className="py-1 px-2 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('skills')}>
                  <div className="flex items-center gap-0.5">Technical Skills <SortIcon field="skills" /></div>
                </th>
                <th className="py-1 px-2 text-right cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleSort('has_missing_skills')}>
                  <div className="flex items-center justify-end gap-0.5">Status <SortIcon field="has_missing_skills" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRoster.length > 0 ? (
                paginatedRoster.map((emp) => (
                  <tr 
                    key={emp.employee_number}
                    onClick={() => onSelectEmployee(emp.employee_number)}
                    className="hover:bg-slate-50/90 cursor-pointer transition-colors"
                  >
                    <td className="py-1 px-2 font-mono text-cyan-700 font-semibold">{emp.employee_number}</td>
                    <td className="py-1 px-2 font-medium text-slate-900">{emp.name}</td>
                    <td className="py-1 px-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {emp.job_level}
                      </span>
                    </td>
                    <td className="py-1 px-2">{emp.location}</td>
                    <td className="py-1 px-2 text-slate-600 truncate max-w-[140px]">{emp.manager}</td>
                    <td className="py-1 px-2">
                      <div className="flex flex-wrap gap-1">
                        {emp.skills.map((s, i) => (
                          <span key={i} className="text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-1 px-2 text-right">
                      {emp.has_missing_skills ? (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold">
                          Missing
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                          Mapped
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
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
