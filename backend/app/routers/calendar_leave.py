from fastapi import APIRouter, Query
from typing import Optional
from backend.app.analytics import analytics_engine
from backend.app.models import CalendarData

router = APIRouter(prefix="/api/calendar", tags=["Calendar & Leaves"])

@router.get("/data", response_model=CalendarData)
def get_calendar_data(
    leave_type: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    manager: Optional[str] = Query(None)
):
    filters = {
        'leave_type': leave_type,
        'department': department,
        'manager': manager
    }
    return analytics_engine.get_calendar_data(filters)
