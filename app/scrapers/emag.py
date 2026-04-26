from .base import BaseScraper
from scrapling.fetchers import StealthyFetcher
from .utils import require, parse_price

class EmagScraper(BaseScraper):

    def __init__(self):
        
        StealthyFetcher.configure(adaptive = True, keep_comments = False, keep_cdata = False )

    def get_price(self, url: str) -> float | None:

        try:
            page = StealthyFetcher.fetch(url, headless=True)

            price_element= require(page.find('p', {'data-test':'main-price'}), 'price element')

            raw = require(price_element.css('p::text').get(), 'raw')
            
            return parse_price(raw)

        except Exception as e :
            print(e)        

      
    
    def get_name(self, url: str) -> str | None:
        
        try:

            page = StealthyFetcher.fetch(url, headless=True)

            name_element = require(page.find('h1', {'class': 'page-title'}), "name element")

            raw = require(name_element.css('h1::text').get(), 'raw')

            return str(raw).strip()

        except Exception as e:
            print(e)

         




