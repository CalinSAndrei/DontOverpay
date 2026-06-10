from fastapi import APIRouter, Form
from app.core.errors import AppException
from app.core.logic import get_logs

router = APIRouter(prefix="", tags=["root"])


@router.get("/logs")
async def fetch_logs():

    logs = get_logs()

    return logs