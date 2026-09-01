from fastapi import APIRouter, Query
from typing import Optional
from backend.app.analytics import analytics_engine
from backend.app.models import Salarywise2KPIs

router = APIRouter(prefix="/api/salarywise2", tags=["Salarywise2"])

@router.get("/kpis", response_model=Salarywise2KPIs)
def get_salarywise2_kpis(
    state: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    salary_bin: Optional[str] = Query(None),
    job_level: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    manager: Optional[str] = Query(None),
):
    filters = {
        'state': state,
        'year': year,
        'salary_bin': salary_bin,
        'job_level': job_level,
        'location': location,
        'department': department,
        'manager': manager,
    }
    return analytics_engine.get_salarywise2_kpis(filters)

