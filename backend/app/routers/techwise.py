from fastapi import APIRouter, Query
from typing import Optional
from backend.app.analytics import analytics_engine
from backend.app.models import TechwiseKPIs

router = APIRouter(prefix="/api/techwise", tags=["Techwise"])

@router.get("/kpis", response_model=TechwiseKPIs)
def get_techwise_kpis(
    state: Optional[str] = Query(None),
    job_level: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    skill_name: Optional[str] = Query(None),
    manager: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    filters = {
        'state': state,
        'job_level': job_level,
        'location': location,
        'skill_name': skill_name,
        'manager': manager,
        'search': search
    }
    return analytics_engine.get_techwise_kpis(filters)
