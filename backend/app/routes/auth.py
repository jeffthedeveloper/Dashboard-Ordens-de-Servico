import os
from flask import Blueprint, request, jsonify
from functools import wraps

auth_bp = Blueprint("auth", __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if token == f"Bearer {os.environ.get("AUTH_TOKEN")}":
            return f(*args, **kwargs)
        return jsonify({"message": "Token inválido ou ausente"}), 401
    return decorated

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = data.get("username")
    pwd = data.get("password")

    if user == os.environ.get("ADMIN_USER") and pwd == os.environ.get("ADMIN_PASS"):
        return jsonify({"token": os.environ.get("AUTH_TOKEN")}), 200
    return jsonify({"error": "Credenciais inválidas"}), 401


