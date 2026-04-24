from .emag import EmagScraper
from .pcgarage import PcGarageScraper
import tldextract
from .base import BaseScraper


REGISTRY = {

    "emag.ro": EmagScraper,
    "pcgarage.ro": PcGarageScraper
}



def extract_domain(url: str) -> str:

    ext = tldextract.extract(url)

    return ext.top_domain_under_public_suffix

def get_scraper(url: str) -> BaseScraper:
    domain = extract_domain(url)
    scraper_class = REGISTRY.get(domain)
    if not scraper_class:
        raise ValueError(f"No scraper registered for {domain}")
    return scraper_class()

def scrape(url: str):
    
    Scraper = get_scraper(url)

    price = Scraper.get_price(url)

    name = Scraper.get_name(url)

    print(price, name)

    return {"price": price, "product": name}
