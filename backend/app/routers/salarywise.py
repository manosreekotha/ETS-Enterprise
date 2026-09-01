from fastapi import APIRouter, Query
from typing import Optional
from backend.app.analytics import analytics_engine
from backend.app.models import SalarywiseKPIs

router = APIRouter(prefix="/api/salarywise", tags=["Salarywise"])

@router.get("/kpis", response_model=SalarywiseKPIs)
def get_salarywise_kpis(
    state: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    salary_bin: Optional[str] = Query(None),
    job_level: Optional[str] = Query(None),
    manager: Optional[str] = Query(None)
):
    filters = {
        'state': state,
        'year': year,
        'salary_bin': salary_bin,
        'job_level': job_level,
        'manager': manager
    }
    return analytics_engine.get_salarywise_kpis(filters)
