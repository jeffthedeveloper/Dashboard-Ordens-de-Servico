from app import db
from datetime import datetime

class Fornecedor(db.Model):
    """Modelo para Fornecedores"""
    __tablename__ = 'fornecedores'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)  # 'Elsys', 'Intelbrás', etc.
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos reversos
    kits = db.relationship('Kit', backref=db.backref('fornecedor', lazy=True))
    contatos = db.relationship('Contato', primaryjoin="and_(Contato.entidade_tipo=='fornecedor', Contato.entidade_id==Fornecedor.id)", 
                              backref=db.backref('fornecedor', lazy=True), viewonly=True)
    
    def __repr__(self):
        return f'<Fornecedor {self.nome}>'
    
    def to_dict(self):
        """Converte o modelo para dicionário"""
        return {
            'id': self.id,
            'nome': self.nome,
            'tipo': self.tipo,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
