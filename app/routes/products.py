from fastapi import APIRouter, Form
from app.scrapers.registry import scrape
from app.core.database import get_product, get_all_products, add_product, get_price_history, update_price_history
from typing import Annotated
import asyncio

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/")
async def list_products():

    products = get_all_products()

    return products


@router.get("/pricehistory")
async def fetch_price_history():

    price_history = get_price_history()

    return price_history

@router.get("/updatehistory")
async def update_history():

    await asyncio.to_thread (update_price_history, scrape)

    return 

@router.get("/{product_id}")
async def fetch_product(product_id: int):

    product = await asyncio.to_thread(get_product, (product_id))

    return product
    

@router.post("/add/")
async def add(url: Annotated[str, Form()]):

    product = await asyncio.to_thread(scrape, url)

    add_product(url, product["product"], product["store"], "Lei", product["price"])

    return {product['product'], product["price"]}
    
