from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.models.usuario import (
    crear_usuario,
    buscar_por_email,
    buscar_por_id,
    actualizar_perfil,
    cambiar_password,
)

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _format_user(user):
    return {
        "id": user["id"],
        "firstName": user["nombre"],
        "lastName": user["apellido"],
        "email": user["email"],
        "phone": user["telefono"] or "",
        "initials": (user["nombre"][0] + user["apellido"][0]).upper(),
    }


@auth_bp.route("/registro", methods=["POST"])
def registro():
    data = request.get_json()
    if not data:
        return jsonify(error="Datos inválidos"), 400

    nombre = data.get("nombre", data.get("firstName", "")).strip()
    apellido = data.get("apellido", data.get("lastName", "")).strip()
    email = data.get("email", "").strip().lower()
    telefono = data.get("telefono", data.get("phone", "")).strip()
    password = data.get("password", "")

    if not all([nombre, apellido, email, password]):
        return jsonify(error="Nombre, apellido, email y password son requeridos"), 400

    if len(password) < 6:
        return jsonify(error="La contraseña debe tener al menos 6 caracteres"), 400

    if buscar_por_email(email):
        return jsonify(error="El email ya está registrado"), 409

    from app import bcrypt
    pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    user_id = crear_usuario(nombre, apellido, email, telefono, pw_hash)

    return jsonify(
        message="Usuario registrado correctamente",
        user={"id": user_id, "nombre": nombre, "apellido": apellido, "email": email},
    ), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify(error="Datos inválidos"), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify(error="Email y password son requeridos"), 400

    user = buscar_por_email(email)
    if not user:
        return jsonify(error="Credenciales inválidas"), 401

    from app import bcrypt
    if not bcrypt.check_password_hash(user["password_hash"], password):
        return jsonify(error="Credenciales inválidas"), 401

    token = create_access_token(identity=str(user["id"]))

    return jsonify(
        token=token,
        user=_format_user(user),
    )


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = buscar_por_id(user_id)
    if not user:
        return jsonify(error="Usuario no encontrado"), 404

    return jsonify(_format_user(user))


@auth_bp.route("/perfil", methods=["PUT"])
@jwt_required()
def perfil():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data:
        return jsonify(error="Datos inválidos"), 400

    actualizar_perfil(
        user_id,
        nombre=data.get("firstName", data.get("nombre")),
        apellido=data.get("lastName", data.get("apellido")),
        telefono=data.get("phone", data.get("telefono")),
    )

    user = buscar_por_id(user_id)
    return jsonify(message="Perfil actualizado", user=_format_user(user))


@auth_bp.route("/cambiar-password", methods=["PUT"])
@jwt_required()
def cambiar_password_route():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data:
        return jsonify(error="Datos inválidos"), 400

    password_actual = data.get("password_actual", "")
    password_nuevo = data.get("password_nuevo", "")

    if not password_actual or not password_nuevo:
        return jsonify(error="password_actual y password_nuevo son requeridos"), 400

    if len(password_nuevo) < 6:
        return jsonify(error="La nueva contraseña debe tener al menos 6 caracteres"), 400

    user = buscar_por_id(user_id)
    if not user:
        return jsonify(error="Usuario no encontrado"), 404

    full_user = buscar_por_email(user["email"])

    from app import bcrypt
    if not bcrypt.check_password_hash(full_user["password_hash"], password_actual):
        return jsonify(error="Contraseña actual incorrecta"), 401

    nuevo_hash = bcrypt.generate_password_hash(password_nuevo).decode("utf-8")
    cambiar_password(user_id, nuevo_hash)

    return jsonify(message="Contraseña actualizada correctamente")
