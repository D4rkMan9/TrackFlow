from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt

from app.config import Config

bcrypt = Bcrypt()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)

    Config.validate()
    app.config.from_object(Config)

    CORS(
        app,
        origins=[app.config["FRONTEND_URL"]],
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    bcrypt.init_app(app)
    jwt.init_app(app)

    from app.db import init_pool
    with app.app_context():
        init_pool()

    from app.routes.auth import auth_bp
    from app.routes.envios import envios_bp
    from app.routes.tracking import tracking_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(envios_bp)
    app.register_blueprint(tracking_bp)
    app.register_blueprint(admin_bp)

    @app.errorhandler(404)
    def not_found(e):
        return jsonify(error="Recurso no encontrado"), 404

    @app.errorhandler(500)
    def internal_error(e):
        app.logger.error(f"Error interno: {e}")
        return jsonify(error="Error interno del servidor"), 500

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify(status="ok")

    return app
