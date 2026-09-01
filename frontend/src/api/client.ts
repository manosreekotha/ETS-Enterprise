import axios from 'axios';
import {
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
  CopilotResponse
} from '../types/dashboard';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const fetchFilterOptions = async (): Promise<FilterOptions> => {
  const res = await api.get('/home/filters');
  return res.data;
};

export const fetchHomeKPIs = async (filters: FilterParams): Promise<HomeKPIs> => {
  const res = await api.get('/home/kpis', { params: filters });
  return res.data;
};

export const fetchStatewiseKPIs = async (filters: FilterParams): Promise<StatewiseKPIs> => {
  const res = await api.get('/statewise/kpis', { params: filters });
  return res.data;
};

export const fetchEmployeeList = async (): Promise<EmployeeListItem[]> => {
  const res = await api.get('/employee/list');
  return res.data;
};

export const fetchEmployeeDetails = async (empNumber: number): Promise<EmployeeDetails> => {
  const res = await api.get(`/employee/${empNumber}`);
  return res.data;
};

export const fetchTechwiseKPIs = async (filters: FilterParams): Promise<TechwiseKPIs> => {
  const res = await api.get('/techwise/kpis', { params: filters });
  return res.data;
};

export const fetchSalarywiseKPIs = async (filters: FilterParams): Promise<SalarywiseKPIs> => {
  const res = await api.get('/salarywise/kpis', { params: filters });
  return res.data;
};

export const fetchSalarywise2KPIs = async (filters: FilterParams): Promise<Salarywise2KPIs> => {
  const res = await api.get('/salarywise2/kpis', { params: filters });
  return res.data;
};

export const fetchCalendarData = async (filters: FilterParams): Promise<CalendarData> => {
  const res = await api.get('/calendar/data', { params: filters });
  return res.data;
};

export const askCopilot = async (question: string, contextTab?: string): Promise<CopilotResponse> => {
  const res = await api.post('/copilot/query', { question, context_tab: contextTab });
  return res.data;
};
