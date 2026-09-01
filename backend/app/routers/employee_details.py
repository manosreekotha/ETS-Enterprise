from fastapi import APIRouter, Query, Path
from typing import Optional, List, Dict, Any
from backend.app.analytics import analytics_engine
from backend.app.data_loader import data_loader
from backend.app.models import EmployeeDetails

router = APIRouter(prefix="/api/employee", tags=["Employee Details"])

@router.get("/list")
def get_employee_search_list():
    df_emp = data_loader.df_employees
    return df_emp[['EMPLOYEE NUMBER', 'EMPLOYEE LABEL', 'JOB TITLE', 'JOB LEVEL', 'DEPARTMENT', 'LOCATION']].to_dict(orient='records')

@router.get("/{emp_number}", response_model=EmployeeDetails)
def get_employee_by_id(emp_number: int = Path(...)):
    return analytics_engine.get_employee_details(emp_number)
