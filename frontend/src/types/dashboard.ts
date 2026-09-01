export interface FilterParams {
  state?: string;
  job_level?: string;
  location?: string;
  department?: string;
  project?: string;
  manager?: string;
  year?: number;
  skill_name?: string;
  salary_bin?: string;
  search?: string;
}

export interface FilterOptions {
  states: string[];
  job_levels: string[];
  locations: string[];
  departments: string[];
  projects: string[];
  managers: string[];
  years: number[];
  skills: string[];
  salary_bins: string[];
}

export interface HomeKPIs {
  total_employees: number;
  male_count: number;
  female_count: number;
  pct_male: number;
  pct_female: number;
  avg_infinite_exp: number;
  avg_prior_exp: number;
  avg_total_exp: number;
  recent_hirings: { [key: string]: number };
  attrition_by_year: { year: string; exits: number; rate: number }[];
  location_distribution: { location: string; count: number; percentage: number }[];
}

export interface StatewiseKPIs {
  selected_sdm: string;
  filtered_employees: number;
  avg_prior_exp: number;
  avg_infinite_exp: number;
  experience_by_grade: {
    job_level: string;
    prior_exp: number;
    infinite_exp: number;
    total_exp: number;
    count: number;
  }[];
  project_grade_distribution: {
    job_level: string;
    project: string;
    count: number;
  }[];
  geography_grade_breakdown: {
    job_level: string;
    location: string;
    count: number;
  }[];
  employee_roster: {
    'EMPLOYEE NUMBER': number;
    'EMPLOYEE LABEL': string;
    'JOB LEVEL': string;
    'JOB TITLE': string;
    'DEPARTMENT': string;
    'LOCATION': string;
    'State': string;
    'Project Working': string;
    'MANAGER': string;
    'Prior_Exp': number;
    'Infinite_Exp': number;
    'Total_Exp': number;
    'M_Salary': number;
    'EMP_CTC1': number;
  }[];
}

export interface EmployeeListItem {
  'EMPLOYEE NUMBER': number;
  'EMPLOYEE LABEL': string;
  'JOB TITLE': string;
  'JOB LEVEL': string;
  'DEPARTMENT': string;
  'LOCATION': string;
}

export interface EmployeeDetails {
  employee_number: number;
  name: string;
  email: string;
  contact_no?: string;
  gender: string;
  location: string;
  state: string;
  department: string;
  job_title: string;
  job_level: string;
  manager: string;
  project: string;
  start_date?: string;
  exit_date?: string;
  prior_exp: number;
  infinite_exp: number;
  total_exp: number;
  skills: {
    'Skill Name': string;
    'Skill Type': string;
    'Skill Level': string;
    'Skill Category'?: string;
    'IsActive'?: string;
    'Assigned Date'?: string;
  }[];
  fresh_skills: string[];
  finance_history: {
    Year: number;
    Base_Salary: number;
    Bonus: number;
    Perks: number;
    Other_Comp: number;
    M_Salary: number;
    Total_CTC: number;
    Hike: number;
    Is_Promotion?: string;
  }[];
}

export interface TechwiseKPIs {
  total_unique_skills: number;
  most_common_skill: string;
  missing_skills_count: number;
  skill_distribution: {
    skill_name: string;
    employee_count: number;
    advanced_count: number;
    intermediate_count: number;
  }[];
  manager_grade_matrix: {
    managers: string[];
    grades: string[];
    matrix: { [manager: string]: { [grade: string]: number } };
  };
  skill_roster: {
    employee_number: number;
    name: string;
    job_level: string;
    manager: string;
    location: string;
    skills: string[];
    has_missing_skills: boolean;
  }[];
}

export interface SalarywiseKPIs {
  total_salary: number;
  avg_salary: number;
  max_salary: number;
  min_salary: number;
  total_ctc: number;
  avg_ctc: number;
  max_ctc: number;
  min_ctc: number;
  total_perks: number;
  total_bonus: number;
  avg_bonus: number;
  manager_grade_ctc_matrix: {
    managers: string[];
    grades: string[];
    matrix: { [manager: string]: { [grade: string]: number } };
  };
  top_n_earners: {
    employee_number: number;
    name: string;
    job_level: string;
    manager: string;
    m_salary: number;
    total_ctc: number;
    base_salary: number;
    bonus: number;
  }[];
}

export interface Salarywise2KPIs {
  team_avg_salary: {
    department: string;
    avg_salary: number;
    avg_ctc: number;
  }[];
  salary_trend_years: {
    year: string;
    avg_salary: number;
    avg_ctc: number;
    avg_bonus: number;
    avg_perks: number;
  }[];
  hike_analysis_promotion: {
    year: string;
    is_promotion: string;
    avg_hike_pct: number;
    headcount: number;
  }[];
  compensation_by_band: {
    salary_bin: string;
    avg_base: number;
    avg_bonus: number;
    avg_perks: number;
    avg_other: number;
  }[];
  monthly_salary_distribution: {
    salary_bin: string;
    count: number;
  }[];
  top_earners: {
    'EMPLOYEE NUMBER': number;
    'EMPLOYEE LABEL': string;
    'JOB LEVEL': string;
    'DEPARTMENT': string;
    'LOCATION': string;
    'M_Salary': number;
    'Total_CTC': number;
    'MANAGER': string;
  }[];
  filtered_count: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  employee_number: number;
  employee_name: string;
  leave_type: string;
  days: number;
  start: string;
  end: string;
  department: string;
  location: string;
}

export interface CalendarData {
  total_leave_days: number;
  unique_employees_on_leave: number;
  leave_type_breakdown: {
    leave_type: string;
    records_count: number;
    total_days: number;
  }[];
  project_distribution: {
    project: string;
    count: number;
  }[];
  manager_grade_matrix: {
    managers: string[];
    grades: string[];
    matrix: { [manager: string]: { [grade: string]: number } };
  };
  geography_grade_matrix: {
    locations: string[];
    grades: string[];
    matrix: { [location: string]: { [grade: string]: number } };
  };
  events: CalendarEvent[];
}

export interface CopilotResponse {
  answer: string;
  insights: string[];
  chart_data?: { name: string; value: number }[];
  chart_type?: 'bar' | 'pie' | 'line';
  related_metrics?: { [key: string]: any };
}
