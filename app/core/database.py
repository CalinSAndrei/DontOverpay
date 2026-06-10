from platformdirs import user_data_dir
import os
import sqlite3
from types import FunctionType

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
                history_id    INTEGER REFERENCES price_history(id),
                created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS price_history(
                id          INTEGER PRIMARY KEY,
                product_id  INTEGER REFERENCES products(id),
                price       REAL NOT NULL,
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS alerts (
                id           INTEGER PRIMARY KEY,
                product_id   INTEGER REFERENCES products(id),
                target_price REAL,
                triggered    BOOLEAN DEFAULT 0,
                created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS logs (
                id          INTEGER PRIMARY KEY,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                source      TEXT,
                status_code INTEGER,
                msg         TEXT
            );
        """)

def insert_product(conn: sqlite3.Connection, url: str, name: str, store: str, currency: str,):
 
    cursor = conn.execute(
        """
        INSERT INTO products (url, name, store, currency)
        VALUES (?, ?, ?, ?)
        """, (url, name, store, currency),
    )

    return cursor.lastrowid

def insert_log(conn: sqlite3.Connection, source: str, status_code: int, msg: str):

    print("Logged")

    return conn.execute("INSERT INTO logs (source, status, msg) VALUES (?, ?, ?)", (source, status_code, msg))
    
def select_product(conn: sqlite3.Connection, product_id: int):
   
    return conn.execute("""SELECT P.*, H.* FROM products P JOIN price_history H ON P.history_id = H.id WHERE P.id = ?""",(product_id,)).fetchone() 

def select_all_products(conn: sqlite3.Connection):
    return conn.execute("""SELECT P.* FROM products P""").fetchall()

def select_all_products_with_price(conn: sqlite3.Connection):
    return conn.execute("""SELECT P.*, H.* FROM products P JOIN price_history H ON P.history_id = H.id ORDER BY P.created_at DESC""").fetchall()

def insert_price_history(conn: sqlite3.Connection, product_id: int, price: float, ):

    cursor = conn.execute(
            """
            INSERT INTO price_history (product_id, price)  
            VALUES (?, ?)
            """, (product_id, price)
        )

    id = cursor.lastrowid

    conn.execute("UPDATE products SET history_id = ? WHERE id = ?", (id, product_id))

    return

def select_price_history(conn: sqlite3.Connection):
    return conn.execute("SELECT * FROM price_history ORDER BY recorded_at ASC").fetchall()
 
def select_logs(conn: sqlite3.Connection):
    return conn.execute("SELECT * FROM logs ORDER BY created_at DESC").fetchall()




