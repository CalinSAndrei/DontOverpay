import re

def require(value, name):
        
    if value is None:
        raise ValueError(f"{name} not found")
    return value

def parse_price(raw: str) -> float:

    clean = re.sub(r'[^\d.,]', '', raw)
    clean = clean.replace('.','').replace(',', '.')
    return float(clean)
