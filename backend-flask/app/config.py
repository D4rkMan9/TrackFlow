import os


class Config:
    REQUIRED_VARS = [
        "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER",
        "SECRET_KEY", "JWT_SECRET_KEY", "FRONTEND_URL",
    ]

    # Base de datos
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = int(os.getenv("DB_PORT", 3306))
    DB_NAME = os.getenv("DB_NAME")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")

    # Flask
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    # CORS
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Tracking
    TRACKING_PREFIX = os.getenv("TRACKING_PREFIX", "ENV25")

    @classmethod
    def validate(cls):
        missing = [v for v in cls.REQUIRED_VARS if not os.getenv(v)]
        if missing:
            raise EnvironmentError(
                f"Faltan variables de entorno requeridas: {', '.join(missing)}"
            )
