import React from 'react';
import { 
  BarChart3, 
  Sparkles, 
  RefreshCw, 
  Maximize2, 
  Users, 
  MapPin, 
  UserCheck, 
  Cpu, 
  BadgeIndianRupee, 
  TrendingUp, 
  CalendarDays,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  copilotOpen: boolean;
  setCopilotOpen: (open: boolean) => void;
  onRefresh: () => void;
  loading: boolean;
  totalEmployees: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  copilotOpen,
  setCopilotOpen,
  onRefresh,
  loading,
  totalEmployees,
}) => {
  const tabs = [
    { id: 'home', label: 'ETS Employee Dashboard', icon: Users },
    { id: 'statewise', label: 'Statewise Dashboard', icon: MapPin },
    { id: 'techwise', label: 'Tech Wise Dashboard', icon: Cpu },
    { id: 'salarywise', label: 'Salary Wise Dashboard', icon: BadgeIndianRupee },
    { id: 'salarywise2', label: 'Salary 2 Wise Dashboard', icon: TrendingUp },
    { id: 'calendar', label: 'Employee Calendar', icon: CalendarDays },
    { id: 'employee_details', label: 'ETS Employee Details', icon: UserCheck },
  ];

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="h-12 bg-white border-b border-slate-200 shadow-sm px-3 flex items-center justify-between shrink-0 select-none z-30">
      {/* Brand & Title */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center shadow-sm shrink-0">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">ETS ENTERPRISE</h1>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
              v2.0
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Workforce Intelligence &amp; Analytics</p>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200 mx-3 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-white text-cyan-800 shadow-sm font-semibold border border-cyan-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Actions & Status */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-slate-500 text-[11px]">Active Roster:</span>
          <span className="font-bold text-slate-800 font-mono text-[11px]">{totalEmployees} Emps</span>
        </div>

        <button
          onClick={onRefresh}
          title="Refresh Dataset Analytics"
          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors flex items-center justify-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-600' : ''}`} />
        </button>

        <button
          onClick={handleFullscreen}
          title="Toggle Fullscreen (Zero Scroll)"
          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors flex items-center justify-center"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setCopilotOpen(!copilotOpen)}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            copilotOpen
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-200 font-semibold'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">AI Copilot</span>
        </button>
      </div>
    </header>
  );

};
