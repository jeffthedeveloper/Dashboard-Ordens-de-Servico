from app import db
from datetime import datetime

class Contato(db.Model):
    """Modelo para Contatos"""
    __tablename__ = 'contatos'
    
    id = db.Column(db.Integer, primary_key=True)
    entidade_tipo = db.Column(db.String(20), nullable=False)  # 'cliente', 'tecnico', 'fornecedor'
    entidade_id = db.Column(db.Integer, nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # 'telefone', 'celular', 'whatsapp', 'email', 'instagram'
    valor = db.Column(db.String(100), nullable=False)
    principal = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Contato {self.tipo}: {self.valor}>'
    
    def to_dict(self):
        """Converte o modelo para dicionário"""
        return {
            'id': self.id,
            'entidade_tipo': self.entidade_tipo,
            'entidade_id': self.entidade_id,
            'tipo': self.tipo,
            'valor': self.valor,
            'principal': self.principal,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
