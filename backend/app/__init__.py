from flask import Flask
from dotenv import load_dotenv
import os

load_dotenv()
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

# Inicialização das extensões
db = SQLAlchemy()
migrate = Migrate()


def create_app(config_name='default'):
    """Função factory para criar a aplicação Flask"""
    app = Flask(__name__)

    # Configuração da aplicação
    if config_name == 'default':
        app.config.from_object('app.config.Config')
    else:
        app.config.from_object(f'app.config.{config_name.capitalize()}Config')

    # Inicialização das extensões com a aplicação
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    # Configura o CORS para permitir o domínio do Vercel
    frontend_url = "https://SEU_DOMINIO_DO_VERCEL.vercel.app"
    CORS(app, resources={
         r"/api/*": {"origins": [frontend_url, "http://localhost:3000"]}})

    # Registro de blueprints
    from app.routes.ordens import ordens_bp
    from app.routes.clientes import clientes_bp
    from app.routes.tecnicos import tecnicos_bp
    from app.routes.relatorios import relatorios_bp

    app.register_blueprint(ordens_bp, url_prefix='/api/ordens')
    app.register_blueprint(clientes_bp, url_prefix='/api/clientes')
    app.register_blueprint(tecnicos_bp, url_prefix='/api/tecnicos')
    app.register_blueprint(relatorios_bp, url_prefix='/api/relatorios')

    # Rota de teste
    @app.route('/api/status')
    def status():
        return {'status': 'online', 'version': '2.0.0'}

    return app
