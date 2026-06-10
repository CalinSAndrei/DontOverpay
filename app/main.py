from fastapi import FastAPI
from fastapi.responses import JSONResponse
from app.core.setup import ensure_scrapling_installed
from app.core.database import init_db
from app.routes import products_router, root_router
from app.core.scheduler import start
from contextlib import asynccontextmanager
from app.core.logic import log_error
from app.core import AppException


ensure_scrapling_installed()
init_db()


class BaseAppException(Exception):
    """Base exception for our application"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


@asynccontextmanager
async def lifespan(app):
    start()
    yield




app = FastAPI(lifespan=lifespan)
app.include_router(products_router)
app.include_router(root_router)


# Global exception handler
@app.exception_handler(Exception)
async def app_exception_handler(request, exc):


    if isinstance(exc, AppException):
        status_code = exc.status_code[0] if isinstance(exc.status_code, tuple) else exc.status_code

        log_error(exc.source, status_code, exc.msg)

        return JSONResponse(
            status_code=status_code,
            content={"Source": exc.source,
                    "Message": exc.msg
                    }
        )

    return JSONResponse(
        content={
            "error": type(exc).__name__,
            "args": exc.args
        }
    )

    