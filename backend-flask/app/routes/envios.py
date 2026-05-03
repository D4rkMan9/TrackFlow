from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.envio import (
    crear_envio,
    buscar_por_id,
    listar_por_usuario,
    stats_por_usuario,
)
from app.models.destinatario import crear_destinatario
from app.models.estado_envio import crear_estado, estado_actual, historial_por_envio
from app.utils.auth_helpers import get_current_user_id
from app.utils.tracking_gen import generar_tracking

envios_bp = Blueprint("envios", __name__, url_prefix="/api/envios")


def format_envio(envio_row, dest_row, historial):
    """Formatea un envío al formato que espera el frontend (Shipment)."""
    estado = historial[-1]["estado"] if historial else "PENDIENTE"

    history = []
    for h in historial:
        history.append({
            "status": h["estado"],
            "description": h["descripcion"] or "",
            "timestamp": h["fecha_hora"].isoformat() if h["fecha_hora"] else None,
        })

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
            "firstName": dest_row["nombre"],
            "lastName": dest_row["apellido"],
            "address": dest_row["direccion"],
            "city": dest_row["localidad"],
            "postalCode": dest_row["codigo_postal"] or "",
            "phone": dest_row["telefono"] or "",
        },
        "history": history,
        "createdAt": (
            envio_row["fecha_creacion"].isoformat()
            if envio_row["fecha_creacion"]
            else None
        ),
    }


def _build_envio_response(envio_row):
    """Construye la respuesta completa de un envío con destinatario e historial."""
    from app.models.destinatario import buscar_por_id as buscar_dest

    dest = buscar_dest(envio_row["destinatario_id"])
    historial = historial_por_envio(envio_row["id"])
    return format_envio(envio_row, dest, historial)


@envios_bp.route("", methods=["GET"])
@jwt_required()
def listar():
    user_id = get_current_user_id()
    envios = listar_por_usuario(user_id)
    result = []
    for e in envios:
        dest = {
            "nombre": e["dest_nombre"],
            "apellido": e["dest_apellido"],
            "direccion": e["dest_direccion"],
            "localidad": e["dest_localidad"],
            "codigo_postal": e["dest_cp"],
            "telefono": e["dest_telefono"],
        }
        historial = historial_por_envio(e["id"])
        result.append(format_envio(e, dest, historial))
    return jsonify(result)


@envios_bp.route("/<int:envio_id>", methods=["GET"])
@jwt_required()
def detalle(envio_id):
    user_id = get_current_user_id()
    envio = buscar_por_id(envio_id)
    if not envio:
        return jsonify(error="Envío no encontrado"), 404
    if envio["usuario_id"] != user_id:
        return jsonify(error="No tienes permiso para ver este envío"), 403
    return jsonify(_build_envio_response(envio))


@envios_bp.route("", methods=["POST"])
@jwt_required()
def crear():
    user_id = get_current_user_id()
    data = request.get_json()
    if not data:
        return jsonify(error="Datos inválidos"), 400

    peso = data.get("weight")
    descripcion = data.get("description", "")
    fecha_estimada = data.get("estimatedDate")
    recipient = data.get("recipient")

    if peso is None:
        return jsonify(error="El peso es requerido"), 400
    if not recipient:
        return jsonify(error="Los datos del destinatario son requeridos"), 400

    for field in ["firstName", "lastName", "address", "city"]:
        if not recipient.get(field):
            return jsonify(error=f"Destinatario: {field} es requerido"), 400

    dest_id = crear_destinatario(
        nombre=recipient["firstName"],
        apellido=recipient["lastName"],
        direccion=recipient["address"],
        localidad=recipient["city"],
        codigo_postal=recipient.get("postalCode", ""),
        telefono=recipient.get("phone", ""),
    )

    tracking = generar_tracking()

    envio_id = crear_envio(
        usuario_id=user_id,
        destinatario_id=dest_id,
        numero_tracking=tracking,
        peso=peso,
        descripcion=descripcion,
        fecha_estimada=fecha_estimada,
    )

    crear_estado(envio_id, "PENDIENTE", "Envío registrado en el sistema")

    return jsonify(
        id=envio_id,
        trackingNumber=tracking,
        status="PENDIENTE",
    ), 201


@envios_bp.route("/<int:envio_id>", methods=["DELETE"])
@jwt_required()
def cancelar(envio_id):
    user_id = get_current_user_id()
    envio = buscar_por_id(envio_id)
    if not envio:
        return jsonify(error="Envío no encontrado"), 404
    if envio["usuario_id"] != user_id:
        return jsonify(error="No tienes permiso para cancelar este envío"), 403

    actual = estado_actual(envio_id)
    if not actual or actual["estado"] != "PENDIENTE":
        return jsonify(error="Solo se pueden cancelar envíos con estado PENDIENTE"), 422

    crear_estado(envio_id, "CANCELADO", "Envío cancelado por el remitente")
    return jsonify(message="Envío cancelado", status="CANCELADO")


@envios_bp.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    user_id = get_current_user_id()
    s = stats_por_usuario(user_id)
    return jsonify(
        total=s["total"],
        enTransito=s["en_transito"],
        entregados=s["entregados"],
    )
