from fastapi import APIRouter, Query
from typing import Optional
from backend.app.analytics import analytics_engine
from backend.app.models import HomeKPIs

router = APIRouter(prefix="/api/home", tags=["Home"])

@router.get("/kpis", response_model=HomeKPIs)
def get_home_kpis(
    state: Optional[str] = Query(None),
    job_level: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    project: Optional[str] = Query(None),
    manager: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    filters = {
        'state': state,
        'job_level': job_level,
        'location': location,
        'department': department,
        'project': project,
        'manager': manager,
        'search': search
    }
    return analytics_engine.get_home_kpis(filters)

@router.get("/filters")
def get_filter_options():
    return analytics_engine.get_filter_options()
