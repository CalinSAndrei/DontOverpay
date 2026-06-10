from fastapi import APIRouter, Form
from app.scrapers.registry import scrape
from app.core.logic import get_all_products, get_all_price_history, update_all_price_history, get_product, add_product, get_logs
from typing import Annotated
import asyncio
from app.core.errors import AppException

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/")
async def list_products():

    products = get_all_products()

    return products

@router.get("/pricehistory")
async def fetch_price_history():

    price_history = get_all_price_history()

    return price_history

@router.get("/updatehistory")
async def update_history():

    await asyncio.to_thread (update_all_price_history)

    return {"status": "updated"}

@router.post("/add/")
async def add(url: Annotated[str, Form()]):
   
   return await asyncio.to_thread(add_product, url)
    
@router.get("/{product_id}")
async def fetch_product(product_id: int):

    product = get_product(product_id)

    return product