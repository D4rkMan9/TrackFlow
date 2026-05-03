import random
import string

from flask import current_app

from app.models.envio import existe_tracking


def generar_tracking(intentos=10):
    prefix = current_app.config["TRACKING_PREFIX"]
    for _ in range(intentos):
        numeros = "".join(random.choices(string.digits, k=8))
        tracking = f"{prefix}{numeros}"
        if not existe_tracking(tracking):
            return tracking
    raise RuntimeError("No se pudo generar un número de tracking único")
