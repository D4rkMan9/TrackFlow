from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request


def get_current_user_id():
    identity = get_jwt_identity()
    return int(identity)


def usuario_es_propietario(envio_usuario_id):
    return get_current_user_id() == envio_usuario_id
