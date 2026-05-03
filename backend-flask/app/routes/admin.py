from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app.models.envio import listar_todos, buscar_por_id, stats_globales
from app.models.estado_envio import crear_estado, estado_actual, historial_por_envio
from app.models.destinatario import buscar_por_id as buscar_dest

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

TRANSICIONES_VALIDAS = {
    "PENDIENTE": ["PROCESANDO", "CANCELADO"],
    "PROCESANDO": ["EN_TRANSITO", "CANCELADO"],
    "EN_TRANSITO": ["EN_DISTRIBUCION", "CANCELADO"],
    "EN_DISTRIBUCION": ["ENTREGADO", "CANCELADO"],
    "ENTREGADO": [],
    "CANCELADO": [],
}


def _format_envio_admin(envio_row):
    dest = {
        "nombre": envio_row["dest_nombre"],
        "apellido": envio_row["dest_apellido"],
        "direccion": envio_row["dest_direccion"],
        "localidad": envio_row["dest_localidad"],
        "codigo_postal": envio_row["dest_cp"],
        "telefono": envio_row["dest_telefono"],
    }
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
        "remitente": {
            "nombre": envio_row["rem_nombre"],
            "apellido": envio_row["rem_apellido"],
            "email": envio_row["rem_email"],
        },
        "history": history,
        "createdAt": (
            envio_row["fecha_creacion"].isoformat()
            if envio_row["fecha_creacion"]
            else None
        ),
    }


@admin_bp.route("/envios", methods=["GET"])
@jwt_required()
def listar_envios():
    estado = request.args.get("estado")
    query = request.args.get("q")
    envios = listar_todos(estado=estado, query=query)
    return jsonify([_format_envio_admin(e) for e in envios])


@admin_bp.route("/envios/<int:envio_id>/estado", methods=["PUT"])
@jwt_required()
def actualizar_estado(envio_id):
    data = request.get_json()
    if not data:
        return jsonify(error="Datos inválidos"), 400

    nuevo_estado = data.get("estado")
    descripcion = data.get("descripcion")

    if not nuevo_estado:
        return jsonify(error="El campo 'estado' es requerido"), 400

    estados_validos = [
        "PENDIENTE", "PROCESANDO", "EN_TRANSITO",
        "EN_DISTRIBUCION", "ENTREGADO", "CANCELADO",
    ]
    if nuevo_estado not in estados_validos:
        return jsonify(error=f"Estado inválido. Válidos: {', '.join(estados_validos)}"), 400

    envio = buscar_por_id(envio_id)
    if not envio:
        return jsonify(error="Envío no encontrado"), 404

    actual = estado_actual(envio_id)
    estado_actual_str = actual["estado"] if actual else "PENDIENTE"

    permitidos = TRANSICIONES_VALIDAS.get(estado_actual_str, [])
    if nuevo_estado not in permitidos:
        return jsonify(
            error=f"Transición inválida: de {estado_actual_str} a {nuevo_estado}. "
                  f"Permitidos: {', '.join(permitidos) or 'ninguno (estado final)'}"
        ), 422

    crear_estado(envio_id, nuevo_estado, descripcion)
    return jsonify(message="Estado actualizado", estado_nuevo=nuevo_estado)


@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    s = stats_globales()
    return jsonify(
        total=s["total"],
        enTransito=s["en_transito"],
        entregados=s["entregados"],
        pendientes=s["pendientes"],
        cancelados=s["cancelados"],
    )
