from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from dotenv import load_dotenv
import os

load_dotenv()

# Inicialização das extensões
db = SQLAlchemy()
migrate = Migrate()


def create_app(config_name='default'):
    """Função factory para criar a aplicação Flask"""
    app = Flask(__name__)

    # Configuração básica sem dependência de config.py
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL', 'sqlite:///database/dev.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Inicialização das extensões com a aplicação
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    # Configura o CORS para permitir o domínio do Vercel
    frontend_url = os.environ.get(
        "FRONTEND_URL", "https://dashboard-os-frontend.onrender.com")
    CORS(app, resources={
         r"/api/*": {"origins": [frontend_url, "http://localhost:3000", "https://dashboard-os-api.onrender.com"]}})

    # Registro de blueprints
    try:
        from app.routes.ordens import ordens_bp
        from app.routes.clientes import clientes_bp
        from app.routes.tecnicos import tecnicos_bp
        from app.routes.relatorios import relatorios_bp

        app.register_blueprint(ordens_bp, url_prefix='/api/ordens')
        app.register_blueprint(clientes_bp, url_prefix='/api/clientes')
        app.register_blueprint(tecnicos_bp, url_prefix='/api/tecnicos')
        app.register_blueprint(relatorios_bp, url_prefix='/api/relatorios')
    except ImportError as e:
        print(f"Warning: Could not import blueprints: {e}")

    # Rota de teste
    @app.route('/api/status')
    def status():
        return {'status': 'online', 'version': '2.0.0'}

    return app
