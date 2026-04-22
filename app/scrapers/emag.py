from .base import Scraper
from scrapling.fetchers import StealthyFetcher


def _require(value, name):
        
    if value is None:
        raise ValueError(f"{name} not found")
    return value


class EmagScraper(Scraper):

    def __init__(self):

        
        StealthyFetcher.configure(adaptive = True, keep_comments = False, keep_cdata = False )

    def get_price(self, url: str) -> float | None:

        try:
            page = StealthyFetcher.fetch(url, headless=True)

            price_element= _require(page.find('p', {'class':'product-new-price'}), 'price element')

            raw = _require(price_element.css('p::text').get(), 'raw')\
            
            return float(raw)

        except Exception as e :
            print(e)        

      
    
    def get_name(self, url: str) -> str | None:
        
        try:

            page = StealthyFetcher.fetch(url, headless=True)

            name_element = _require(page.find('h1', {'class': 'page-title'}), "name element")

            raw = _require(name_element.css('h1::text').get(), 'raw')

            return str(raw)

        except Exception as e:
            print(e)

         




