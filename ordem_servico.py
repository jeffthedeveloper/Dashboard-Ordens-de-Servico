from app import db
from datetime import datetime

class OrdemServico(db.Model):
    """Modelo para Ordens de Serviço"""
    __tablename__ = 'ordens_servico'
    
    id = db.Column(db.Integer, primary_key=True)
    numero_os = db.Column(db.String(20), unique=True, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    data_criacao = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    data_instalacao = db.Column(db.DateTime, nullable=True)
    data_vencimento = db.Column(db.DateTime, nullable=False)
    
    # Relacionamentos
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    tecnico_campo_id = db.Column(db.Integer, db.ForeignKey('tecnicos.id'), nullable=False)
    tecnico_app_id = db.Column(db.Integer, db.ForeignKey('tecnicos.id'), nullable=True)
    cidade_id = db.Column(db.Integer, db.ForeignKey('cidades.id'), nullable=False)
    
    # Campos adicionais
    fez_na_rua = db.Column(db.Boolean, default=False)
    baixou_no_app = db.Column(db.Boolean, default=False)
    observacoes = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos reversos
    cliente = db.relationship('Cliente', backref=db.backref('ordens_servico', lazy=True))
    tecnico_campo = db.relationship('Tecnico', foreign_keys=[tecnico_campo_id], backref=db.backref('ordens_campo', lazy=True))
    tecnico_app = db.relationship('Tecnico', foreign_keys=[tecnico_app_id], backref=db.backref('ordens_app', lazy=True))
    cidade = db.relationship('Cidade', backref=db.backref('ordens_servico', lazy=True))
    kits = db.relationship('Kit', backref=db.backref('ordem_servico', lazy=True))
    
    def __repr__(self):
        return f'<OrdemServico {self.numero_os}>'
    
    def to_dict(self):
        """Converte o modelo para dicionário"""
        return {
            'id': self.id,
            'numero_os': self.numero_os,
            'status': self.status,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_instalacao': self.data_instalacao.isoformat() if self.data_instalacao else None,
            'data_vencimento': self.data_vencimento.isoformat() if self.data_vencimento else None,
            'cliente_id': self.cliente_id,
            'tecnico_campo_id': self.tecnico_campo_id,
            'tecnico_app_id': self.tecnico_app_id,
            'cidade_id': self.cidade_id,
            'fez_na_rua': self.fez_na_rua,
            'baixou_no_app': self.baixou_no_app,
            'observacoes': self.observacoes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
