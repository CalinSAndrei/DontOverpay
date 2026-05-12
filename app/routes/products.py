from fastapi import APIRouter, Form
from app.scrapers.registry import scrape
from app.core.database import select_product, select_all_products, insert_product, select_price_history, insert_price_in_price_history
from typing import Annotated
import asyncio

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/")
async def list_products():

    products = select_all_products()

    return products


@router.get("/pricehistory")
async def fetch_price_history():

    price_history = select_price_history()

    return price_history

@router.get("/updatehistory")
async def update_history():

    await asyncio.to_thread (insert_price_in_price_history, scrape)

    return 

@router.get("/{product_id}")
async def fetch_product(product_id: int):

    product = await asyncio.to_thread(select_product, (product_id))

    return product

@router.post("/add/")
async def add(url: Annotated[str, Form()]):

    product = await asyncio.to_thread(scrape, url)

    if product["price"] == None:
        raise ValueError("Price Not found")

    insert_product(url, product["product"], product["store"], "Lei", product["price"])

    return {product['product'], product["price"]}
    
