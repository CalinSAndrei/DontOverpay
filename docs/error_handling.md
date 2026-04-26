# Error Handling

## The Core Idea

An exception should be caught **where you can do something useful with it** — not just to prevent a crash.
Catching an error and silently returning `None` is almost always wrong, because:
- The caller doesn't know what went wrong
- `None` propagates silently and causes confusing errors later
- You lose the original error message and stack trace

---

## The Three Layers

Think of your app as three layers, each with a different job:

```
API route (FastAPI)      ← catch here, return HTTP error to client
    |
Service / scraper        ← let exceptions raise, don't catch
    |
Utility functions        ← raise exceptions with clear messages
```

### Utility functions — raise, don't return None

```python
def require(value, name):
    if value is None:
        raise ValueError(f"Could not find: {name}")
    return value
```

If something is missing, raise immediately with a message that explains what's missing.

### Scrapers — let exceptions propagate

```python
def get_price(self, url: str) -> float:
    page = StealthyFetcher.fetch(url, headless=True)
    price_element = require(page.css('p[data-test="main-price"].product-new-price').first, 'price element')
    raw = require(price_element.css('p::text').get(), 'raw price text')
    return parse_price(raw)
```

No `try/except` here. If anything fails, let it raise up to the caller.
The scraper's job is to scrape — not to decide what happens when it fails.

### API route — catch and return a proper response

```python
@app.get("/price")
def get_price(url: str):
    try:
        price = scraper.get_price(url)
        return {"price": price}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Scraping failed")
```

This is where you actually handle the error — you convert it into an HTTP response the client can understand.

---

## Custom Exceptions (Optional but Useful)

Instead of generic `ValueError`, you can define your own exceptions to be more specific:

```python
class ScrapingError(Exception):
    pass

class ElementNotFoundError(ScrapingError):
    pass
```

Then in your scraper:
```python
raise ElementNotFoundError(f"Could not find price element on {url}")
```

And in your route you can catch them separately:
```python
except ElementNotFoundError:
    raise HTTPException(status_code=404, detail="Price not found on this page")
except ScrapingError:
    raise HTTPException(status_code=502, detail="Scraping failed")
```

This lets you give the client more specific error messages without leaking internal details.

---

## What Not To Do

```python
# Bad — swallows the error, caller gets None with no explanation
try:
    price = get_price(url)
except Exception as e:
    print(e)

# Bad — catches everything in the wrong place
def get_price(self, url):
    try:
        ...
    except:
        return None

# Bad — raising a generic exception with no message
raise Exception("error")
```

---

## Quick Rules

1. Raise early, catch late — raise as soon as something is wrong, catch at the top level
2. Never swallow exceptions with a bare `except` and `return None`
3. Always include a message when raising — say what was missing or what failed
4. In FastAPI, convert exceptions to `HTTPException` at the route level
5. Use custom exceptions when you need to distinguish between different failure types
