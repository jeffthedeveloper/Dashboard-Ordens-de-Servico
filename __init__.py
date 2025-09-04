import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    # Configurações do banco de dados
    database_url = os.environ.get('DATABASE_URL', 'sqlite:///database/dev.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configurações de segurança
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    
    db.init_app(app)

    # Registrar blueprints
    from .routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api')

    from .routes.cidades import cidades_bp
    from .routes.clientes import clientes_bp
    from .routes.ordens import ordens_bp
    from .routes.relatorios import relatorios_bp
    from .routes.tecnicos import tecnicos_bp

    app.register_blueprint(cidades_bp, url_prefix='/api/cidades')
    app.register_blueprint(clientes_bp, url_prefix='/api/clientes')
    app.register_blueprint(ordens_bp, url_prefix='/api/ordens')
    app.register_blueprint(relatorios_bp, url_prefix='/api/relatorios')
    app.register_blueprint(tecnicos_bp, url_prefix='/api/tecnicos')

    return app


