from flask import Blueprint, request, jsonify
from app.models import OrdemServico, Cliente, Tecnico, Cidade
from app import db
from datetime import datetime

ordens_bp = Blueprint('ordens', __name__)

@ordens_bp.route('/', methods=['GET'])
def listar_ordens():
    """Lista todas as ordens de serviço com filtros opcionais"""
    # Parâmetros de filtro
    status = request.args.get('status')
    tecnico_id = request.args.get('tecnico_id')
    cidade_id = request.args.get('cidade_id')
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    
    # Consulta base
    query = OrdemServico.query
    
    # Aplicar filtros
    if status:
        query = query.filter(OrdemServico.status == status)
    if tecnico_id:
        query = query.filter(OrdemServico.tecnico_campo_id == tecnico_id)
    if cidade_id:
        query = query.filter(OrdemServico.cidade_id == cidade_id)
    if data_inicio:
        data_inicio = datetime.fromisoformat(data_inicio)
        query = query.filter(OrdemServico.data_criacao >= data_inicio)
    if data_fim:
        data_fim = datetime.fromisoformat(data_fim)
        query = query.filter(OrdemServico.data_criacao <= data_fim)
    
    # Executar consulta
    ordens = query.all()
    
    # Converter para dicionários
    resultado = [ordem.to_dict() for ordem in ordens]
    
    return jsonify(resultado)

@ordens_bp.route('/<int:id>', methods=['GET'])
def obter_ordem(id):
    """Obtém detalhes de uma ordem de serviço específica"""
    ordem = OrdemServico.query.get_or_404(id)
    return jsonify(ordem.to_dict())

@ordens_bp.route('/', methods=['POST'])
def criar_ordem():
    """Cria uma nova ordem de serviço"""
    dados = request.json
    
    # Validar dados obrigatórios
    campos_obrigatorios = ['numero_os', 'status', 'data_criacao', 'data_vencimento', 
                          'cliente_id', 'tecnico_campo_id', 'cidade_id']
    for campo in campos_obrigatorios:
        if campo not in dados:
            return jsonify({'erro': f'Campo obrigatório ausente: {campo}'}), 400
    
    # Converter datas de string para datetime
    if isinstance(dados['data_criacao'], str):
        dados['data_criacao'] = datetime.fromisoformat(dados['data_criacao'])
    if isinstance(dados['data_vencimento'], str):
        dados['data_vencimento'] = datetime.fromisoformat(dados['data_vencimento'])
    if 'data_instalacao' in dados and dados['data_instalacao'] and isinstance(dados['data_instalacao'], str):
        dados['data_instalacao'] = datetime.fromisoformat(dados['data_instalacao'])
    
    # Criar nova ordem
    nova_ordem = OrdemServico(
        numero_os=dados['numero_os'],
        status=dados['status'],
        data_criacao=dados['data_criacao'],
        data_vencimento=dados['data_vencimento'],
        data_instalacao=dados.get('data_instalacao'),
        cliente_id=dados['cliente_id'],
        tecnico_campo_id=dados['tecnico_campo_id'],
        tecnico_app_id=dados.get('tecnico_app_id'),
        cidade_id=dados['cidade_id'],
        fez_na_rua=dados.get('fez_na_rua', False),
        baixou_no_app=dados.get('baixou_no_app', False),
        observacoes=dados.get('observacoes')
    )
    
    # Salvar no banco de dados
    db.session.add(nova_ordem)
    try:
        db.session.commit()
        return jsonify(nova_ordem.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

@ordens_bp.route('/<int:id>', methods=['PUT'])
def atualizar_ordem(id):
    """Atualiza uma ordem de serviço existente"""
    ordem = OrdemServico.query.get_or_404(id)
    dados = request.json
    
    # Atualizar campos
    if 'status' in dados:
        ordem.status = dados['status']
    if 'data_instalacao' in dados:
        if dados['data_instalacao'] and isinstance(dados['data_instalacao'], str):
            ordem.data_instalacao = datetime.fromisoformat(dados['data_instalacao'])
        else:
            ordem.data_instalacao = dados['data_instalacao']
    if 'data_vencimento' in dados and isinstance(dados['data_vencimento'], str):
        ordem.data_vencimento = datetime.fromisoformat(dados['data_vencimento'])
    if 'tecnico_campo_id' in dados:
        ordem.tecnico_campo_id = dados['tecnico_campo_id']
    if 'tecnico_app_id' in dados:
        ordem.tecnico_app_id = dados['tecnico_app_id']
    if 'fez_na_rua' in dados:
        ordem.fez_na_rua = dados['fez_na_rua']
    if 'baixou_no_app' in dados:
        ordem.baixou_no_app = dados['baixou_no_app']
    if 'observacoes' in dados:
        ordem.observacoes = dados['observacoes']
    
    # Salvar alterações
    try:
        db.session.commit()
        return jsonify(ordem.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

@ordens_bp.route('/<int:id>', methods=['DELETE'])
def excluir_ordem(id):
    """Exclui uma ordem de serviço"""
    ordem = OrdemServico.query.get_or_404(id)
    
    try:
        db.session.delete(ordem)
        db.session.commit()
        return jsonify({'mensagem': 'Ordem de serviço excluída com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

@ordens_bp.route('/proximas-vencimento', methods=['GET'])
def proximas_vencimento():
    """Lista ordens de serviço próximas do vencimento"""
    dias = request.args.get('dias', 7, type=int)
    
    # Consulta para ordens próximas do vencimento
    from sqlalchemy import func
    import datetime as dt
    
    data_limite = dt.datetime.utcnow() + dt.timedelta(days=dias)
    
    ordens = OrdemServico.query.filter(
        OrdemServico.status != 'INSTALADA',
        OrdemServico.data_vencimento <= data_limite
    ).order_by(OrdemServico.data_vencimento).all()
    
    resultado = [ordem.to_dict() for ordem in ordens]
    
    return jsonify(resultado)

@ordens_bp.route('/metricas', methods=['GET'])
def metricas_ordens():
    """Retorna métricas sobre as ordens de serviço"""
    # Total por status
    from sqlalchemy import func
    
    total_por_status = db.session.query(
        OrdemServico.status, 
        func.count(OrdemServico.id)
    ).group_by(OrdemServico.status).all()
    
    # Total geral
    total_geral = OrdemServico.query.count()
    
    # Total instaladas
    total_instaladas = OrdemServico.query.filter(OrdemServico.status == 'INSTALADA').count()
    
    # Taxa de conclusão
    taxa_conclusao = (total_instaladas / total_geral) * 100 if total_geral > 0 else 0
    
    # Resultado
    metricas = {
        'total_geral': total_geral,
        'total_instaladas': total_instaladas,
        'taxa_conclusao': round(taxa_conclusao, 2),
        'por_status': {status: total for status, total in total_por_status}
    }
    
    return jsonify(metricas)
