import mysql.connector
from mysql.connector import pooling
from app.config import Config


_pool = None


def init_pool():
    global _pool
    _pool = pooling.MySQLConnectionPool(
        pool_name="trackflow_pool",
        pool_size=5,
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        database=Config.DB_NAME,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        charset="utf8mb4",
        use_unicode=True,
        use_pure=True,
    )


def get_connection():
    if _pool is None:
        init_pool()
    return _pool.get_connection()


def _fix_double_encoding(value):
    """Fix UTF-8 double-encoding caused by MariaDB latin1 server charset."""
    if isinstance(value, str):
        try:
            return value.encode("latin1").decode("utf-8")
        except (UnicodeDecodeError, UnicodeEncodeError):
            return value
    return value


def fix_row(row):
    """Apply _fix_double_encoding to all string values in a dict row."""
    if row is None:
        return None
    return {k: _fix_double_encoding(v) for k, v in row.items()}
