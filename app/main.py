from app.core.setup import ensure_scrapling_installed
from app.scrapers.emag import EmagScraper


emag = EmagScraper()

url = 'https://www.emag.ro/apple-macbook-air-13-cu-procesor-apple-m5-10-nuclee-cpu-8-nuclee-gpu-16gb-ram-512gb-ssd-midnight-tastatura-internationala-manual-ro-mdhe4ro-a/pd/DGWN0M2BM/?ref=fam#512-GB'

price = emag.get_price(url)

name = emag.get_name(url)

print(price, name.strip()) # type: ignore