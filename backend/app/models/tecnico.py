from app import db
from datetime import datetime

class Tecnico(db.Model):
    """Modelo para Técnicos"""
    __tablename__ = 'tecnicos'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    identificacao_campo = db.Column(db.String(50), nullable=True)
    identificacao_app = db.Column(db.String(50), nullable=True)
    ativo = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos reversos
    contatos = db.relationship('Contato', primaryjoin="and_(Contato.entidade_tipo=='tecnico', Contato.entidade_id==Tecnico.id)", 
                              backref=db.backref('tecnico', lazy=True), viewonly=True)
    kits = db.relationship('Kit', backref=db.backref('tecnico', lazy=True))
    
    def __repr__(self):
        return f'<Tecnico {self.nome}>'
    
    def to_dict(self):
        """Converte o modelo para dicionário"""
        return {
            'id': self.id,
            'nome': self.nome,
            'identificacao_campo': self.identificacao_campo,
            'identificacao_app': self.identificacao_app,
            'ativo': self.ativo,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
