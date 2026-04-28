from fastapi import FastAPI
from app.core.setup import ensure_scrapling_installed
from app.core.database import init_db
from app.routes.products import router as products_router

ensure_scrapling_installed()
init_db()

app = FastAPI()
app.include_router(products_router)