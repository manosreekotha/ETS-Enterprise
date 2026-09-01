import React from 'react';
import type { FilterParams, FilterOptions } from '../../types/dashboard';
import { Filter, RotateCcw, Search } from 'lucide-react';

interface FilterBarProps {
  filters: FilterParams;
  setFilters: React.Dispatch<React.SetStateAction<FilterParams>>;
  options: FilterOptions | null;
  activeTab: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  options,
  activeTab,
}) => {
  const handleChange = (key: keyof FilterParams, value: string) => {
    setFilters((prev) => {
      const next: Record<string, any> = { ...prev };
      if (!value) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next as FilterParams;
    });
  };

  const handleReset = () => {
    setFilters({});
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="h-9 bg-white border-b border-slate-200 px-3 flex items-center justify-between gap-2 shrink-0 select-none text-xs">
      {/* Left Slicer Controls */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-0.5">
        <div className="flex items-center gap-1 text-slate-500 shrink-0 font-medium">
          <Filter className="w-3.5 h-3.5 text-cyan-600" />
          <span className="text-[11px] font-semibold text-slate-700">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-cyan-600 text-white font-bold text-[9px] flex items-center justify-center font-mono">
              {activeFilterCount}
            </span>
          )}
        </div>

        {/* State Slicer */}
        <select
          value={filters.state || ''}
          onChange={(e) => handleChange('state', e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2 py-0.8 text-[11px] font-medium focus:outline-none focus:border-cyan-500 hover:border-slate-300"
        >
          <option value="">State (All)</option>
          {options?.states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Job Level / Grade Slicer */}
        <select
          value={filters.job_level || ''}
          onChange={(e) => handleChange('job_level', e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2 py-0.8 text-[11px] font-medium focus:outline-none focus:border-cyan-500 hover:border-slate-300"
        >
          <option value="">Grade (All)</option>
          {options?.job_levels.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>

        {/* Location Slicer */}
        <select
          value={filters.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2 py-0.8 text-[11px] font-medium focus:outline-none focus:border-cyan-500 hover:border-slate-300"
        >
          <option value="">Location (All)</option>
          {options?.locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        {/* Department Slicer */}
        <select
          value={filters.department || ''}
          onChange={(e) => handleChange('department', e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2 py-0.8 text-[11px] font-medium focus:outline-none focus:border-cyan-500 hover:border-slate-300"
        >
          <option value="">Department (All)</option>
          {options?.departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Project Working Slicer */}
        <select
          value={filters.project || ''}
          onChange={(e) => handleChange('project', e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2 py-0.8 text-[11px] font-medium focus:outline-none focus:border-cyan-500 hover:border-slate-300"
        >
          <option value="">Project (All)</option>
          {options?.projects.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Reporting Manager Slicer */}
        <select
          value={filters.manager || ''}
          onChange={(e) => handleChange('manager', e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2 py-0.8 text-[11px] font-medium focus:outline-none focus:border-cyan-500 hover:border-slate-300 max-w-[150px] truncate"
        >
          <option value="">Manager (All)</option>
          {options?.managers.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* Year Slicer */}
        {(activeTab === 'salarywise' || activeTab === 'salarywise2') && (
          <select
            value={filters.year || ''}
            onChange={(e) => handleChange('year', e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2 py-0.8 text-[11px] font-medium focus:outline-none focus:border-cyan-500 hover:border-slate-300"
          >
            <option value="">Year (All)</option>
            {options?.years.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        )}

        {/* Skill Slicer */}
        {activeTab === 'techwise' && (
          <select
            value={filters.skill_name || ''}
            onChange={(e) => handleChange('skill_name', e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2 py-0.8 text-[11px] font-medium focus:outline-none focus:border-cyan-500 hover:border-slate-300"
          >
            <option value="">Skill (All)</option>
            {options?.skills.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      {/* Right Search Input & Clear Filters */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative flex items-center">
          <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search employee / ID..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-[11px] pl-6 pr-2 py-1 rounded-md focus:outline-none focus:border-cyan-500 w-40 hover:border-slate-300 leading-none"
          />
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[10px] font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.8 rounded-md transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
