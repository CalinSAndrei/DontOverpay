from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.database import update_price_history
from app.scrapers.registry import scrape

scheduler = AsyncIOScheduler()

def periodic_task():

    print('Starting Scrape')
    update_price_history(scrape)
    print("Site Scraped")

scheduler.add_job(periodic_task, "interval", hours=12)

def start():

    scheduler.start()