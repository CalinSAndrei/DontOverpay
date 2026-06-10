from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.core.logic import update_all_price_history

scheduler = AsyncIOScheduler()

def periodic_task():

    try: 
        update_all_price_history()

    except Exception as e:
        raise



scheduler.add_job(periodic_task, "interval", hours=12)

def start():

    scheduler.start()