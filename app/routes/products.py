from fastapi import APIRouter, Form
from app.scrapers.registry import scrape
from app.core.database import get_product, get_all_products, add_product
from typing import Annotated
import asyncio

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/")
async def list_products():

    products = get_all_products()


    return products


@router.get("/{product_id}")
async def get_product(product_id: int):

    pass
    

@router.post("/add/")
async def add(url: Annotated[str, Form()]):

    product = await asyncio.to_thread(scrape, url)

    add_product(url, product["product"], product["store"], "Lei", product["price"])

    return {product['product'], product["price"]}

