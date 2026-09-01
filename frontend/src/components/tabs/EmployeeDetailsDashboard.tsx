import React, { useState } from 'react';
import type { EmployeeDetails, EmployeeListItem } from '../../types/dashboard';
import { KPICard } from '../common/KPICard';
import { ExportButton } from '../common/ExportButton';
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  Award, 
  Clock, 
  TrendingUp, 
  Code, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  ComposedChart,
  Bar,
  Line
} from 'recharts';

interface EmployeeDetailsDashboardProps {
  employee: EmployeeDetails | null;
  employeeList: EmployeeListItem[];
  selectedEmpNumber?: number;
  onSelectEmployee: (empNumber: number) => void;
  loading: boolean;
}

export const EmployeeDetailsDashboard: React.FC<EmployeeDetailsDashboardProps> = ({
  employee,
  employeeList,
  onSelectEmployee,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredList = employeeList.filter(
    (e) =>
      e['EMPLOYEE LABEL'].toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(e['EMPLOYEE NUMBER']).includes(searchTerm)
  );

  if (loading || !employee) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Employee 360 Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-2 overflow-hidden select-none">
      {/* Top Search & Profile Bar */}
      <div className="glass-panel rounded-xl p-2 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center font-bold text-white text-sm shadow-xs shrink-0 font-mono">
            {employee.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">{employee.name}</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                Grade {employee.job_level}
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-medium">ID: {employee.employee_number}</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium">{employee.job_title} · {employee.department} · {employee.location} ({employee.state})</p>
          </div>
        </div>

        {/* Searchable Autocomplete Employee Dropdown */}
        <div className="relative min-w-[280px]">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-left text-slate-800 flex items-center justify-between hover:border-cyan-500 hover:bg-white transition-colors"
          >
            <span className="truncate font-medium">{employee.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 flex flex-col gap-1">
              <input
                type="text"
                placeholder="Search by name or ID (590 employees)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-2 py-1 rounded focus:outline-none focus:border-cyan-500"
                autoFocus
              />
              <div className="max-h-56 overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
                {filteredList.slice(0, 40).map((e) => (
                  <button
                    key={e['EMPLOYEE NUMBER']}
                    onClick={() => {
                      onSelectEmployee(e['EMPLOYEE NUMBER']);
                      setDropdownOpen(false);
                    }}
                    className={`text-left px-2 py-1 rounded text-[11px] flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      e['EMPLOYEE NUMBER'] === employee.employee_number ? 'bg-cyan-50 text-cyan-800 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate max-w-[200px]">{e['EMPLOYEE LABEL']}</span>
                    <span className="text-[10px] font-mono text-slate-500">{e['JOB LEVEL']}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Detail Cards Grid */}
      <div className="grid grid-cols-6 gap-2 shrink-0">
        <KPICard
          title="Reporting Manager"
          value={employee.manager.split('(')[0].trim() || 'Unassigned'}
          subtitle={employee.manager}
          icon={User}
          badge="Hierarchy"
          badgeColor="cyan"
        />
        <KPICard
          title="Infinite Experience"
          value={`${employee.infinite_exp} Yrs`}
          subtitle={`Joined: ${employee.start_date || 'N/A'}`}
          icon={Clock}
          badge="Tenure"
          badgeColor="emerald"
        />
        <KPICard
          title="Prior Experience"
          value={`${employee.prior_exp} Yrs`}
          subtitle="Non-ETS External Experience"
          icon={Briefcase}
          badge="Prior"
          badgeColor="amber"
        />
        <KPICard
          title="Total Experience"
          value={`${employee.total_exp} Yrs`}
          subtitle="Cumulative Experience"
          icon={Award}
          badge="Total"
          badgeColor="purple"
        />
        <KPICard
          title="Official Email"
          value={employee.email.split('@')[0]}
          subtitle={employee.email}
          icon={Mail}
          badge="Infinite"
          badgeColor="blue"
        />
        <KPICard
          title="Project / State"
          value={employee.project}
          subtitle={`Location: ${employee.location}`}
          icon={MapPin}
          badge={employee.state}
          badgeColor="cyan"
        />
      </div>

      {/* Middle & Bottom: Skills, Finance Table & Financial Trends Chart */}
      <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
        {/* Left Column: Skills & Info */}
        <div className="col-span-4 flex flex-col gap-2 min-h-0">
          <div className="glass-panel rounded-xl p-2.5 flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
              <div className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-600" />
                <span className="text-xs font-bold text-slate-800 tracking-tight">Competencies & Skills</span>
              </div>
              <span className="text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200 font-mono font-semibold">
                {employee.skills.length} Mapped
              </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar my-1.5 flex flex-wrap content-start gap-1.5">
              {employee.skills.length > 0 ? (
                employee.skills.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 min-w-[120px] max-w-full"
                  >
                    <span className="text-xs font-semibold text-slate-800">{s['Skill Name']}</span>
                    <span className={`text-[9px] font-bold px-1 py-0.2 rounded border ${
                      s['Skill Level'] === 'Advanced'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {s['Skill Level']}
                    </span>
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-6 text-slate-400 text-xs">
                  <p>No technical skills mapped for this employee.</p>
                  <p className="text-[10px] text-slate-500 mt-1">Self-service skill inventory update pending.</p>
                </div>
              )}
            </div>

            {/* Fresh Edge Skills */}
            <div className="pt-1.5 border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-1 text-[10px] text-purple-700 font-bold mb-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>Fresh Edge Capabilities:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {employee.fresh_skills.length > 0 ? (
                  employee.fresh_skills.map((f, i) => (
                    <span key={i} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      {f}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-500">None assigned</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial History Pivot & Trend Chart */}
        <div className="col-span-8 flex flex-col gap-2 min-h-0">
          <div className="glass-panel rounded-xl p-2.5 flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1 shrink-0">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-bold text-slate-800 tracking-tight">Annual Trends of Bonus, CTC, Perks and Hike %</span>
              </div>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">Multi-Year Progression</span>
            </div>

            <div className="flex-1 min-h-0 pt-1">
              {employee.finance_history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={employee.finance_history} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="Year" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${(v*100).toFixed(0)}%`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0f172a' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '2px' }} />
                    <Bar yAxisId="left" dataKey="Base_Salary" fill="#0284c7" name="Base Salary" radius={[3, 3, 0, 0]} />
                    <Bar yAxisId="left" dataKey="Bonus" fill="#10b981" name="Bonus" radius={[3, 3, 0, 0]} />
                    <Bar yAxisId="left" dataKey="Perks" fill="#f59e0b" name="Perks" radius={[3, 3, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="Hike" stroke="#ec4899" strokeWidth={2} name="Hike %" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  No multi-year financial history available for this employee.
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="glass-panel rounded-xl p-2 shrink-0 h-32 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1 shrink-0">
              <span className="text-xs font-bold text-slate-800 tracking-tight">Financial Details Pivot Table</span>
              <ExportButton data={employee.finance_history} filename={`financial_history_${employee.employee_number}.csv`} />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar my-0.5">
              <table className="w-full text-left text-[11px] text-slate-700">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-0.5 px-2">Year</th>
                    <th className="py-0.5 px-2 text-right">Base Salary</th>
                    <th className="py-0.5 px-2 text-right">Bonus</th>
                    <th className="py-0.5 px-2 text-right">Perks</th>
                    <th className="py-0.5 px-2 text-right">Other Comp</th>
                    <th className="py-0.5 px-2 text-right">Monthly Sal</th>
                    <th className="py-0.5 px-2 text-right font-bold text-slate-900">Total CTC</th>
                    <th className="py-0.5 px-2 text-right">Hike %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {employee.finance_history.map((f, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="py-0.5 px-2 font-sans font-bold text-cyan-700">{f.Year}</td>
                      <td className="py-0.5 px-2 text-right">₹{f.Base_Salary.toLocaleString()}</td>
                      <td className="py-0.5 px-2 text-right text-emerald-700">₹{f.Bonus.toLocaleString()}</td>
                      <td className="py-0.5 px-2 text-right text-amber-700">₹{f.Perks.toLocaleString()}</td>
                      <td className="py-0.5 px-2 text-right">₹{f.Other_Comp.toLocaleString()}</td>
                      <td className="py-0.5 px-2 text-right">₹{f.M_Salary.toLocaleString()}</td>
                      <td className="py-0.5 px-2 text-right font-bold text-slate-900">₹{f.Total_CTC.toLocaleString()}</td>
                      <td className="py-0.5 px-2 text-right text-rose-600 font-bold">{(f.Hike * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
