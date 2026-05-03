from flask import Blueprint, jsonify, request

from app.models.envio import buscar_por_tracking
from app.models.estado_envio import historial_por_envio
from app.models.destinatario import buscar_por_id as buscar_dest

tracking_bp = Blueprint("tracking", __name__, url_prefix="/api/tracking")


def _format_envio(envio_row):
    dest = buscar_dest(envio_row["destinatario_id"])
    historial = historial_por_envio(envio_row["id"])
    estado = historial[-1]["estado"] if historial else "PENDIENTE"

    history = [
        {
            "status": h["estado"],
            "description": h["descripcion"] or "",
            "timestamp": h["fecha_hora"].isoformat() if h["fecha_hora"] else None,
        }
        for h in historial
    ]

    return {
        "id": str(envio_row["id"]),
        "trackingNumber": envio_row["numero_tracking"],
        "description": envio_row["descripcion"] or "",
        "weight": float(envio_row["peso"]),
        "estimatedDate": (
            envio_row["fecha_estimada"].isoformat()
            if envio_row["fecha_estimada"]
            else None
        ),
        "status": estado,
        "recipient": {
            "firstName": dest["nombre"],
            "lastName": dest["apellido"],
            "address": dest["direccion"],
            "city": dest["localidad"],
            "postalCode": dest["codigo_postal"] or "",
            "phone": dest["telefono"] or "",
        },
        "history": history,
        "createdAt": (
            envio_row["fecha_creacion"].isoformat()
            if envio_row["fecha_creacion"]
            else None
        ),
    }


@tracking_bp.route("/<string:numero_tracking>", methods=["GET"])
def consultar(numero_tracking):
    envio = buscar_por_tracking(numero_tracking)
    if not envio:
        return jsonify(error="Envío no encontrado"), 404
    return jsonify(_format_envio(envio))
