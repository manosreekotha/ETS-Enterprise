import React, { useState } from 'react';
import type { CalendarData } from '../../types/dashboard';
import { KPICard } from '../common/KPICard';
import { 
  CalendarDays, 
  Users, 
  Clock,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface EmployeeCalendarDashboardProps {
  data: CalendarData | null;
  loading: boolean;
  onSelectEmployee: (empNumber: number) => void;
}

const LEAVE_COLORS: { [key: string]: string } = {
  'Casual / Sick': '#0284c7',
  'Privilege': '#10b981',
  'LOP': '#f43f5e',
  'Maternity': '#ec4899',
  'Paternity': '#8b5cf6',
  'Bereavement': '#64748b',
};

const PROJECT_COLORS = ['#0284c7', '#0d9488', '#d97706', '#8b5cf6'];

export const EmployeeCalendarDashboard: React.FC<EmployeeCalendarDashboardProps> = ({
  data,
  loading,
  onSelectEmployee,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2024-01-16');
  const [matrixSearch, setMatrixSearch] = useState<string>('');
  const [matrixSortField, setMatrixSortField] = useState<string>('location');
  const [matrixSortDir, setMatrixSortDir] = useState<'asc' | 'desc'>('asc');

  if (loading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Attendance & Leave Schedules...</span>
        </div>
      </div>
    );
  }

  const toggleMatrixSort = (field: string) => {
    if (matrixSortField === field) {
      setMatrixSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setMatrixSortField(field);
      setMatrixSortDir('asc');
    }
  };

  const MatrixSortIcon = ({ field }: { field: string }) => {
    if (matrixSortField !== field) return <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 inline ml-1 opacity-70" />;
    return matrixSortDir === 'asc' ? (
      <ArrowUp className="w-2.5 h-2.5 text-cyan-600 inline ml-1" />
    ) : (
      <ArrowDown className="w-2.5 h-2.5 text-cyan-600 inline ml-1" />
    );
  };

  const sortedLocations = (data.geography_grade_matrix.locations || [])
    .filter((loc) => !matrixSearch.trim() || loc.toLowerCase().includes(matrixSearch.toLowerCase().trim()))
    .sort((a, b) => {
      if (matrixSortField === 'location') {
        return matrixSortDir === 'asc'
          ? a.localeCompare(b)
          : b.localeCompare(a);
      }
      if (matrixSortField === 'total') {
        const aTotal = Object.values(data.geography_grade_matrix.matrix[a] || {}).reduce((x, y) => x + y, 0);
        const bTotal = Object.values(data.geography_grade_matrix.matrix[b] || {}).reduce((x, y) => x + y, 0);
        return matrixSortDir === 'asc' ? aTotal - bTotal : bTotal - aTotal;
      }
      const aVal = (data.geography_grade_matrix.matrix[a] || {})[matrixSortField] || 0;
      const bVal = (data.geography_grade_matrix.matrix[b] || {})[matrixSortField] || 0;
      return matrixSortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const eventsOnSelectedDate = data.events.filter(
    (ev) => ev.start <= selectedDate && ev.end >= selectedDate
  );

  const daysInJan = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex-1 flex flex-col gap-2 overflow-hidden select-none">
      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
        <KPICard
          title="Total Leave Days Recorded"
          value={`${data.total_leave_days} Days`}
          subtitle="Annual Logged Time-off"
          icon={CalendarDays}
          badge="Utilization"
          badgeColor="cyan"
        />
        <KPICard
          title="Unique Employees on Leave"
          value={data.unique_employees_on_leave}
          subtitle="Workforce Members with Leave Logged"
          icon={Users}
          badge="Employees"
          badgeColor="emerald"
        />
        <KPICard
          title="Primary Leave Type"
          value="Casual / Sick"
          subtitle="512 Records (64% of total time-off)"
          icon={Clock}
          badge="Predominant"
          badgeColor="purple"
        />
      </div>

      {/* Middle Grid: Interactive Calendar Grid + Inspector + Project Pie */}
      <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
        {/* Left 5 cols: Interactive Visual Calendar Grid */}
        <div className="col-span-5 glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-cyan-600" />
              <span className="text-xs font-bold text-slate-800 tracking-tight">Interactive Leave Schedule (January 2024)</span>
            </div>
            <span className="text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 font-semibold">Month View</span>
          </div>

          <div className="flex-1 flex flex-col justify-between my-1">
            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 border-b border-slate-100 pb-1">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className="text-slate-400">Sat</span>
              <span className="text-slate-400">Sun</span>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 flex-1 py-1">
              {daysInJan.map((d) => {
                const dateStr = `2024-01-${String(d).padStart(2, '0')}`;
                const hasLeaves = data.events.some((ev) => ev.start <= dateStr && ev.end >= dateStr);
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-7 rounded flex flex-col items-center justify-center relative text-[11px] font-mono transition-all ${
                      isSelected
                        ? 'bg-cyan-600 text-white font-bold shadow-xs'
                        : hasLeaves
                        ? 'bg-cyan-50/70 border border-cyan-200 text-cyan-900 font-semibold hover:bg-cyan-100'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{d}</span>
                    {hasLeaves && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 absolute bottom-0.5"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 shrink-0 font-medium">
            <span>Selected Date: <strong className="text-slate-900 font-mono">{selectedDate}</strong></span>
            <span>{eventsOnSelectedDate.length} Employees Scheduled</span>
          </div>
        </div>

        {/* Center 4 cols: Daily Roster on Selected Date */}
        <div className="col-span-4 glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-800 tracking-tight">On Leave on {selectedDate}</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-mono font-semibold">
              {eventsOnSelectedDate.length} Records
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar my-1 flex flex-col gap-1.5">
            {eventsOnSelectedDate.length > 0 ? (
              eventsOnSelectedDate.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => onSelectEmployee(ev.employee_number)}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:border-cyan-400 cursor-pointer transition-all flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{ev.employee_name}</p>
                    <p className="text-[10px] text-slate-500 font-medium truncate">{ev.department} · {ev.location}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span 
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                      style={{ 
                        color: LEAVE_COLORS[ev.leave_type] || '#0284c7',
                        borderColor: `${LEAVE_COLORS[ev.leave_type] || '#0284c7'}50`,
                        backgroundColor: `${LEAVE_COLORS[ev.leave_type] || '#0284c7'}15`
                      }}
                    >
                      {ev.leave_type}
                    </span>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">{ev.days} Day(s)</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                <p>No leaves recorded for this date.</p>
                <p className="text-[10px] text-slate-500 mt-1">Full workforce active.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 3 cols: Workforce by Project Working Pie */}
        <div className="col-span-3 glass-panel rounded-xl p-2.5 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Project Working Spread</span>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">Distribution</span>
          </div>

          <div className="flex-1 min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.project_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius="48%"
                  outerRadius="72%"
                  paddingAngle={3}
                  dataKey="count"
                >
                  {data.project_distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PROJECT_COLORS[index % PROJECT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100 shrink-0 text-center">
            {data.project_distribution.slice(0, 3).map((p, i) => (
              <div key={p.project} className="p-1 rounded bg-slate-50 border border-slate-200">
                <p className="text-[9px] text-slate-500 truncate font-medium">{p.project}</p>
                <p className="text-[11px] font-bold text-slate-900 font-mono" style={{ color: PROJECT_COLORS[i] }}>{p.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Breakdown of Workforce by Geography and Job Level (Pivot Table) */}
      <div className="glass-panel rounded-xl p-2.5 shrink-0 h-40 flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Workforce Breakdown by Geography and Job Level</span>
            <span className="text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 font-semibold">Cross-Tabulation Matrix</span>
          </div>

          <div className="relative flex items-center">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search location..."
              value={matrixSearch}
              onChange={(e) => setMatrixSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-[11px] pl-6 pr-6 py-0.5 rounded-md focus:outline-none focus:border-cyan-500 w-44 hover:border-slate-300 transition-colors leading-none"
            />
            {matrixSearch && (
              <button
                onClick={() => setMatrixSearch('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2"
              >
                <X className="w-3 h-3 text-slate-400 hover:text-rose-500" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar my-0.5">
          <table className="w-full text-left text-[11px] text-slate-700">
            <thead className="sticky top-0 bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 z-10">
              <tr>
                <th className="py-0.5 px-2 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleMatrixSort('location')}>
                  <div className="flex items-center gap-0.5">Location <MatrixSortIcon field="location" /></div>
                </th>
                {data.geography_grade_matrix.grades.map((g) => (
                  <th key={g} className="py-0.5 px-1.5 text-center cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleMatrixSort(g)}>
                    <div className="flex items-center justify-center gap-0.5">{g} <MatrixSortIcon field={g} /></div>
                  </th>
                ))}
                <th className="py-0.5 px-2 text-right font-bold text-slate-900 cursor-pointer hover:text-cyan-700 select-none" onClick={() => toggleMatrixSort('total')}>
                  <div className="flex items-center justify-end gap-0.5">Total <MatrixSortIcon field="total" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {sortedLocations.length > 0 ? (
                sortedLocations.map((loc) => {
                  const row = data.geography_grade_matrix.matrix[loc] || {};
                  const rowTotal = Object.values(row).reduce((a, b) => a + b, 0);
                  return (
                    <tr key={loc} className="hover:bg-slate-50/80">
                      <td className="py-0.5 px-2 font-sans text-slate-900 font-medium">{loc}</td>
                      {data.geography_grade_matrix.grades.map((g) => (
                        <td key={g} className="py-0.5 px-1.5 text-center">
                          {row[g] || '-'}
                        </td>
                      ))}
                      <td className="py-0.5 px-2 text-right font-bold text-cyan-700">{rowTotal}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={data.geography_grade_matrix.grades.length + 2} className="py-4 text-center text-slate-400 text-xs font-sans">
                    No matching locations found for "{matrixSearch}"
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
