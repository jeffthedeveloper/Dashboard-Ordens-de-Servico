from app import db
from datetime import datetime

class Kit(db.Model):
    """Modelo para Kits"""
    __tablename__ = 'kits'
    
    id = db.Column(db.Integer, primary_key=True)
    fornecedor_id = db.Column(db.Integer, db.ForeignKey('fornecedores.id'), nullable=False)
    serial = db.Column(db.String(100), unique=True, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # 'disponível', 'alocado', 'instalado'
    tecnico_id = db.Column(db.Integer, db.ForeignKey('tecnicos.id'), nullable=True)
    ordem_servico_id = db.Column(db.Integer, db.ForeignKey('ordens_servico.id'), nullable=True)
    data_alocacao = db.Column(db.DateTime, nullable=True)
    data_instalacao = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos reversos
    componentes = db.relationship('Componente', backref=db.backref('kit', lazy=True))
    
    def __repr__(self):
        return f'<Kit {self.serial}>'
    
    def to_dict(self):
        """Converte o modelo para dicionário"""
        return {
            'id': self.id,
            'fornecedor_id': self.fornecedor_id,
            'serial': self.serial,
            'status': self.status,
            'tecnico_id': self.tecnico_id,
            'ordem_servico_id': self.ordem_servico_id,
            'data_alocacao': self.data_alocacao.isoformat() if self.data_alocacao else None,
            'data_instalacao': self.data_instalacao.isoformat() if self.data_instalacao else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
