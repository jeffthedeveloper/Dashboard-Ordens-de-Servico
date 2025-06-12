from app import db
from datetime import datetime

class Cliente(db.Model):
    """Modelo para Clientes"""
    __tablename__ = 'clientes'
    
    id = db.Column(db.Integer, primary_key=True)
    nome_completo = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=True)
    endereco = db.Column(db.String(200), nullable=False)
    bairro = db.Column(db.String(100), nullable=False)
    cidade_id = db.Column(db.Integer, db.ForeignKey('cidades.id'), nullable=False)
    uf = db.Column(db.String(2), nullable=False)
    cep = db.Column(db.String(10), nullable=True)
    ponto_referencia = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos reversos
    cidade = db.relationship('Cidade', backref=db.backref('clientes', lazy=True))
    contatos = db.relationship('Contato', primaryjoin="and_(Contato.entidade_tipo=='cliente', Contato.entidade_id==Cliente.id)", 
                              backref=db.backref('cliente', lazy=True), viewonly=True)
    
    def __repr__(self):
        return f'<Cliente {self.nome_completo}>'
    
    def to_dict(self):
        """Converte o modelo para dicionário"""
        return {
            'id': self.id,
            'nome_completo': self.nome_completo,
            'cpf': self.cpf,
            'endereco': self.endereco,
            'bairro': self.bairro,
            'cidade_id': self.cidade_id,
            'uf': self.uf,
            'cep': self.cep,
            'ponto_referencia': self.ponto_referencia,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
