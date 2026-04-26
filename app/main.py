from app.core.setup import ensure_scrapling_installed
from app.scrapers import EmagScraper, PcGarageScraper, BaseScraper
from app.scrapers.registry import scrape
import tldextract
from fastapi import FastAPI, Form
from typing import Annotated
import asyncio
from app.core.setup import ensure_scrapling_installed


ensure_scrapling_installed()

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post('/scrape')
async def login(url: Annotated[str, Form()]):
    
    result = await asyncio.to_thread(scrape, url)

    print(result) 

    return result