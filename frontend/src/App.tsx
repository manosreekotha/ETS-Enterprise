import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { FilterBar } from './components/layout/FilterBar';
import { HomeDashboard } from './components/tabs/HomeDashboard';
import { StatewiseDashboard } from './components/tabs/StatewiseDashboard';
import { EmployeeDetailsDashboard } from './components/tabs/EmployeeDetailsDashboard';
import { TechwiseDashboard } from './components/tabs/TechwiseDashboard';
import { SalarywiseDashboard } from './components/tabs/SalarywiseDashboard';
import { Salarywise2Dashboard } from './components/tabs/Salarywise2Dashboard';
import { EmployeeCalendarDashboard } from './components/tabs/EmployeeCalendarDashboard';
import { AICopilotDrawer } from './components/copilot/AICopilotDrawer';
import type {
  FilterParams,
  FilterOptions,
  HomeKPIs,
  StatewiseKPIs,
  EmployeeListItem,
  EmployeeDetails,
  TechwiseKPIs,
  SalarywiseKPIs,
  Salarywise2KPIs,
  CalendarData,
} from './types/dashboard';
import {
  fetchFilterOptions,
  fetchHomeKPIs,
  fetchStatewiseKPIs,
  fetchEmployeeList,
  fetchEmployeeDetails,
  fetchTechwiseKPIs,
  fetchSalarywiseKPIs,
  fetchSalarywise2KPIs,
  fetchCalendarData,
} from './api/client';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterParams>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Tab Data States
  const [homeData, setHomeData] = useState<HomeKPIs | null>(null);
  const [statewiseData, setStatewiseData] = useState<StatewiseKPIs | null>(null);
  const [employeeList, setEmployeeList] = useState<EmployeeListItem[]>([]);
  const [selectedEmpNumber, setSelectedEmpNumber] = useState<number>(1019272);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeDetails | null>(null);
  const [techwiseData, setTechwiseData] = useState<TechwiseKPIs | null>(null);
  const [salarywiseData, setSalarywiseData] = useState<SalarywiseKPIs | null>(null);
  const [salarywise2Data, setSalarywise2Data] = useState<Salarywise2KPIs | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);

  // Load Filter Options & Employee List on Mount
  useEffect(() => {
    const initBaseData = async () => {
      try {
        const [opts, emps] = await Promise.all([
          fetchFilterOptions(),
          fetchEmployeeList(),
        ]);
        setFilterOptions(opts);
        setEmployeeList(emps);
        if (emps.length > 0) {
          setSelectedEmpNumber(emps[0]['EMPLOYEE NUMBER']);
        }
      } catch (err) {
        console.error('Error initializing base data:', err);
      }
    };
    initBaseData();
  }, []);

  // Fetch Tab Specific Data based on activeTab and filters
  const loadActiveTabData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'home') {
        const res = await fetchHomeKPIs(filters);
        setHomeData(res);
      } else if (activeTab === 'statewise') {
        const res = await fetchStatewiseKPIs(filters);
        setStatewiseData(res);
      } else if (activeTab === 'employee_details') {
        const res = await fetchEmployeeDetails(selectedEmpNumber);
        setEmployeeDetails(res);
      } else if (activeTab === 'techwise') {
        const res = await fetchTechwiseKPIs(filters);
        setTechwiseData(res);
      } else if (activeTab === 'salarywise') {
        const res = await fetchSalarywiseKPIs(filters);
        setSalarywiseData(res);
      } else if (activeTab === 'salarywise2') {
        const res = await fetchSalarywise2KPIs(filters);
        setSalarywise2Data(res);
      } else if (activeTab === 'calendar') {
        const res = await fetchCalendarData(filters);
        setCalendarData(res);
      }
    } catch (err) {
      console.error('Error fetching tab data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, selectedEmpNumber]);

  useEffect(() => {
    loadActiveTabData();
  }, [loadActiveTabData]);

  // Navigate to Employee 360 view for a specific employee
  const handleSelectEmployee = (empNumber: number) => {
    setSelectedEmpNumber(empNumber);
    setActiveTab('employee_details');
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-100/90 text-slate-900 select-none">
      {/* Executive Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        copilotOpen={copilotOpen}
        setCopilotOpen={setCopilotOpen}
        onRefresh={loadActiveTabData}
        loading={loading}
        totalEmployees={homeData?.total_employees || 590}
      />

      {/* Inline Slicer / Filter Bar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        options={filterOptions}
        activeTab={activeTab}
      />

      {/* Main Viewport Container - ZERO GLOBAL SCROLLBAR */}
      <main className="flex-1 p-2 flex flex-col overflow-hidden min-h-0 relative bg-slate-100/70">
        {activeTab === 'home' && (
          <HomeDashboard
            data={homeData}
            loading={loading && !homeData}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'statewise' && (
          <StatewiseDashboard
            data={statewiseData}
            loading={loading && !statewiseData}
            onSelectEmployee={handleSelectEmployee}
          />
        )}

        {activeTab === 'employee_details' && (
          <EmployeeDetailsDashboard
            employee={employeeDetails}
            employeeList={employeeList}
            selectedEmpNumber={selectedEmpNumber}
            onSelectEmployee={setSelectedEmpNumber}
            loading={loading && !employeeDetails}
          />
        )}

        {activeTab === 'techwise' && (
          <TechwiseDashboard
            data={techwiseData}
            loading={loading && !techwiseData}
            onSelectEmployee={handleSelectEmployee}
          />
        )}

        {activeTab === 'salarywise' && (
          <SalarywiseDashboard
            data={salarywiseData}
            loading={loading && !salarywiseData}
            onSelectEmployee={handleSelectEmployee}
          />
        )}

        {activeTab === 'salarywise2' && (
          <Salarywise2Dashboard
            data={salarywise2Data}
            loading={loading && !salarywise2Data}
            onSelectEmployee={handleSelectEmployee}
          />
        )}

        {activeTab === 'calendar' && (
          <EmployeeCalendarDashboard
            data={calendarData}
            loading={loading && !calendarData}
            onSelectEmployee={handleSelectEmployee}
          />
        )}

        {/* AI Copilot Drawer */}
        <AICopilotDrawer
          isOpen={copilotOpen}
          onClose={() => setCopilotOpen(false)}
          activeTab={activeTab}
        />
      </main>
    </div>
  );
};

export default App;
