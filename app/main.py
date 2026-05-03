from fastapi import FastAPI
from app.core.setup import ensure_scrapling_installed
from app.core.database import init_db
from app.routes.products import router as products_router
from app.core.scheduler import start
from contextlib import asynccontextmanager

ensure_scrapling_installed()
init_db()

@asynccontextmanager
async def lifespan(app):
    start()
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(products_router)