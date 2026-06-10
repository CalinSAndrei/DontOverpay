from app.core.database import insert_price_history, insert_product, select_all_products, select_product, get_conn, select_all_products_with_price, select_price_history, insert_log, select_logs as select_logs
from app.scrapers.registry import scrape
from app.scrapers.utils import require


def add_product(url: str): 
   
    product = scrape(url)

    with get_conn() as conn:

        id = insert_product(conn, url, product["name"], product["store"], "lei")

        insert_price_history(conn, require(id, "product_id"), product["price"] )

    return {"name": product["name"],"price": product["price"]}

def get_all_products():

    with get_conn() as conn:

        return select_all_products_with_price(conn)

def update_all_price_history():

    with get_conn() as conn:

        products = select_all_products(conn)

        for product in products:

            try:
                
                id = product["id"]

                url = product["url"]

                scraped = scrape(url)

                insert_price_history(conn, id, scraped["price"])

                return     

            except Exception as e:
                return
    
def get_all_price_history():

    with get_conn() as conn: 

        product_history = select_price_history(conn)

        return product_history

def get_product(product_id: int):


    with get_conn() as conn:

        return select_product(conn, product_id)
    
def log_error(source: str, status_code: int, msg: str):

    with get_conn() as conn:

        insert_log(conn, source, status_code, msg);

    return (source, status_code, msg)

def get_logs():

    with get_conn() as conn:

        logs = select_logs(conn)

        return logs