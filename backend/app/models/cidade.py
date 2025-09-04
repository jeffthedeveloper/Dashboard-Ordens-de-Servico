from app import db
from datetime import datetime

class Cidade(db.Model):
    """Modelo para Cidades"""
    __tablename__ = 'cidades'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    uf = db.Column(db.String(2), nullable=False)
    regiao = db.Column(db.String(50), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Cidade {self.nome}-{self.uf}>'
    
    def to_dict(self):
        """Converte o modelo para dicionário"""
        return {
            'id': self.id,
            'nome': self.nome,
            'uf': self.uf,
            'regiao': self.regiao,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
