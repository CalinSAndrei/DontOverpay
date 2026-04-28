from platformdirs import user_data_dir
import os
import sqlite3

_default = user_data_dir("DontOverpay","DontOverpay")
DATA_DIR = os.environ.get("DONTOVERPAY_DATA", _default)
os.makedirs(DATA_DIR, exist_ok=True)
DB_PATH = os.path.join(DATA_DIR, "dontoverpay.db")

def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS products (
                id            INTEGER PRIMARY KEY,
                url           TEXT UNIQUE,
                name          TEXT,
                store         TEXT,
                currency      TEXT,
                current_price REAL,
                last_checked  TIMESTAMP,
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS price_history (
                id          INTEGER PRIMARY KEY,
                product_id  INTEGER REFERENCES products(id),
                price       REAL,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS alerts (
                id           INTEGER PRIMARY KEY,
                product_id   INTEGER REFERENCES products(id),
                target_price REAL,
                triggered    BOOLEAN DEFAULT 0,
                created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

def add_product(url: str, name: str, store: str, currency: str, price: float):

    with get_conn() as conn: 
        cursor = conn.execute(
            """
            INSERT INTO products (url, name, store, currency, current_price, last_checked)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (url, name, store, currency, price),
        )

        return cursor.lastrowid
    
def get_product(product_id: int):
    with get_conn() as conn:
        return conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()

def get_all_products():
    with get_conn() as conn:
        return conn.execute("SELECT * FROM products ORDER BY created_at DESC").fetchall()


