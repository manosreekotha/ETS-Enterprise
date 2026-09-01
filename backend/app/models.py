from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class FilterParams(BaseModel):
    state: Optional[str] = None
    job_level: Optional[str] = None
    location: Optional[str] = None
    department: Optional[str] = None
    project: Optional[str] = None
    manager: Optional[str] = None
    year: Optional[int] = None
    skill_name: Optional[str] = None
    salary_bin: Optional[str] = None
    search: Optional[str] = None

class HomeKPIs(BaseModel):
    total_employees: int
    male_count: int
    female_count: int
    pct_male: float
    pct_female: float
    avg_infinite_exp: float
    avg_prior_exp: float
    avg_total_exp: float
    recent_hirings: Dict[str, int]
    attrition_by_year: List[Dict[str, Any]]
    location_distribution: List[Dict[str, Any]]

class StatewiseKPIs(BaseModel):
    selected_sdm: str
    filtered_employees: int
    avg_prior_exp: float
    avg_infinite_exp: float
    experience_by_grade: List[Dict[str, Any]]
    project_grade_distribution: List[Dict[str, Any]]
    geography_grade_breakdown: List[Dict[str, Any]]
    employee_roster: List[Dict[str, Any]]

class EmployeeDetails(BaseModel):
    employee_number: int
    name: str
    email: str
    contact_no: Optional[str]
    gender: str
    location: str
    state: str
    department: str
    job_title: str
    job_level: str
    manager: str
    project: str
    start_date: Optional[str]
    exit_date: Optional[str]
    prior_exp: float
    infinite_exp: float
    total_exp: float
    skills: List[Dict[str, Any]]
    fresh_skills: List[str]
    finance_history: List[Dict[str, Any]]

class TechwiseKPIs(BaseModel):
    total_unique_skills: int
    most_common_skill: str
    missing_skills_count: int
    skill_distribution: List[Dict[str, Any]]
    manager_grade_matrix: Dict[str, Any]
    skill_roster: List[Dict[str, Any]]

class SalarywiseKPIs(BaseModel):
    total_salary: float
    avg_salary: float
    max_salary: float
    min_salary: float
    total_ctc: float
    avg_ctc: float
    max_ctc: float
    min_ctc: float
    total_perks: float
    total_bonus: float
    avg_bonus: float
    manager_grade_ctc_matrix: Dict[str, Any]
    top_n_earners: List[Dict[str, Any]]

class Salarywise2KPIs(BaseModel):
    team_avg_salary: List[Dict[str, Any]]
    salary_trend_years: List[Dict[str, Any]]
    hike_analysis_promotion: List[Dict[str, Any]]
    compensation_by_band: List[Dict[str, Any]]
    monthly_salary_distribution: List[Dict[str, Any]]
    top_earners: List[Dict[str, Any]]
    filtered_count: int = 0


class CalendarData(BaseModel):
    total_leave_days: float
    unique_employees_on_leave: int
    leave_type_breakdown: List[Dict[str, Any]]
    project_distribution: List[Dict[str, Any]]
    manager_grade_matrix: Dict[str, Any]
    geography_grade_matrix: Dict[str, Any]
    events: List[Dict[str, Any]]

class CopilotQueryRequest(BaseModel):
    question: str
    context_tab: Optional[str] = None

class CopilotQueryResponse(BaseModel):
    answer: str
    insights: List[str]
    chart_data: Optional[List[Dict[str, Any]]] = None
    chart_type: Optional[str] = None
    related_metrics: Optional[Dict[str, Any]] = None
