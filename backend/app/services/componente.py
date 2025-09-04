from app import db
from datetime import datetime

class Componente(db.Model):
    """Modelo para Componentes dos Kits"""
    __tablename__ = 'componentes'
    
    id = db.Column(db.Integer, primary_key=True)
    kit_id = db.Column(db.Integer, db.ForeignKey('kits.id'), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)  # 'antena', 'parábola', 'lnb', 'conector', 'parafuso', 'haste', 'cabo'
    quantidade = db.Column(db.Integer, nullable=False, default=1)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Componente {self.tipo} ({self.quantidade})>'
    
    def to_dict(self):
        """Converte o modelo para dicionário"""
        return {
            'id': self.id,
            'kit_id': self.kit_id,
            'tipo': self.tipo,
            'quantidade': self.quantidade,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
