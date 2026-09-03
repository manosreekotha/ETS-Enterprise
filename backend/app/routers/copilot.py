from fastapi import APIRouter
from backend.app.ai_agent import ai_agent
from backend.app.models import CopilotQueryRequest, CopilotQueryResponse

router = APIRouter(prefix="/api/copilot", tags=["AI Copilot"])

@router.post("/query", response_model=CopilotQueryResponse)
def query_copilot(req: CopilotQueryRequest):
    return ai_agent.process_query(req.question, context_tab=req.context_tab, history=req.history)

