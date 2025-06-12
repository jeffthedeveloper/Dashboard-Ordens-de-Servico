from flask import Blueprint, request, jsonify
from app.models import Tecnico, Contato, OrdemServico
from app import db
from sqlalchemy import func

tecnicos_bp = Blueprint('tecnicos', __name__)

@tecnicos_bp.route('/', methods=['GET'])
def listar_tecnicos():
    """Lista todos os técnicos com filtros opcionais"""
    # Parâmetros de filtro
    ativo = request.args.get('ativo')
    
    # Consulta base
    query = Tecnico.query
    
    # Aplicar filtros
    if ativo is not None:
        ativo_bool = ativo.lower() == 'true'
        query = query.filter(Tecnico.ativo == ativo_bool)
    
    # Executar consulta
    tecnicos = query.all()
    
    # Converter para dicionários
    resultado = [tecnico.to_dict() for tecnico in tecnicos]
    
    return jsonify(resultado)

@tecnicos_bp.route('/<int:id>', methods=['GET'])
def obter_tecnico(id):
    """Obtém detalhes de um técnico específico"""
    tecnico = Tecnico.query.get_or_404(id)
    
    # Obter contatos do técnico
    contatos = Contato.query.filter_by(entidade_tipo='tecnico', entidade_id=id).all()
    contatos_dict = [contato.to_dict() for contato in contatos]
    
    # Montar resposta
    resultado = tecnico.to_dict()
    resultado['contatos'] = contatos_dict
    
    return jsonify(resultado)

@tecnicos_bp.route('/', methods=['POST'])
def criar_tecnico():
    """Cria um novo técnico"""
    dados = request.json
    
    # Validar dados obrigatórios
    if 'nome' not in dados:
        return jsonify({'erro': 'Campo obrigatório ausente: nome'}), 400
    
    # Criar novo técnico
    novo_tecnico = Tecnico(
        nome=dados['nome'],
        identificacao_campo=dados.get('identificacao_campo'),
        identificacao_app=dados.get('identificacao_app'),
        ativo=dados.get('ativo', True)
    )
    
    # Salvar no banco de dados
    db.session.add(novo_tecnico)
    
    try:
        db.session.commit()
        
        # Adicionar contatos, se fornecidos
        if 'contatos' in dados and isinstance(dados['contatos'], list):
            for contato_dados in dados['contatos']:
                contato = Contato(
                    entidade_tipo='tecnico',
                    entidade_id=novo_tecnico.id,
                    tipo=contato_dados['tipo'],
                    valor=contato_dados['valor'],
                    principal=contato_dados.get('principal', False)
                )
                db.session.add(contato)
            
            db.session.commit()
        
        # Obter técnico com contatos
        resultado = novo_tecnico.to_dict()
        contatos = Contato.query.filter_by(entidade_tipo='tecnico', entidade_id=novo_tecnico.id).all()
        resultado['contatos'] = [contato.to_dict() for contato in contatos]
        
        return jsonify(resultado), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

@tecnicos_bp.route('/<int:id>', methods=['PUT'])
def atualizar_tecnico(id):
    """Atualiza um técnico existente"""
    tecnico = Tecnico.query.get_or_404(id)
    dados = request.json
    
    # Atualizar campos
    if 'nome' in dados:
        tecnico.nome = dados['nome']
    if 'identificacao_campo' in dados:
        tecnico.identificacao_campo = dados['identificacao_campo']
    if 'identificacao_app' in dados:
        tecnico.identificacao_app = dados['identificacao_app']
    if 'ativo' in dados:
        tecnico.ativo = dados['ativo']
    
    # Salvar alterações
    try:
        db.session.commit()
        
        # Atualizar contatos, se fornecidos
        if 'contatos' in dados and isinstance(dados['contatos'], list):
            # Remover contatos existentes
            Contato.query.filter_by(entidade_tipo='tecnico', entidade_id=id).delete()
            
            # Adicionar novos contatos
            for contato_dados in dados['contatos']:
                contato = Contato(
                    entidade_tipo='tecnico',
                    entidade_id=tecnico.id,
                    tipo=contato_dados['tipo'],
                    valor=contato_dados['valor'],
                    principal=contato_dados.get('principal', False)
                )
                db.session.add(contato)
            
            db.session.commit()
        
        # Obter técnico atualizado com contatos
        resultado = tecnico.to_dict()
        contatos = Contato.query.filter_by(entidade_tipo='tecnico', entidade_id=tecnico.id).all()
        resultado['contatos'] = [contato.to_dict() for contato in contatos]
        
        return jsonify(resultado)
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

@tecnicos_bp.route('/<int:id>', methods=['DELETE'])
def excluir_tecnico(id):
    """Exclui um técnico"""
    tecnico = Tecnico.query.get_or_404(id)
    
    try:
        # Verificar se há ordens de serviço associadas
        ordens_count = OrdemServico.query.filter(
            (OrdemServico.tecnico_campo_id == id) | 
            (OrdemServico.tecnico_app_id == id)
        ).count()
        
        if ordens_count > 0:
            return jsonify({
                'erro': f'Não é possível excluir o técnico pois existem {ordens_count} ordens de serviço associadas'
            }), 400
        
        # Remover contatos associados
        Contato.query.filter_by(entidade_tipo='tecnico', entidade_id=id).delete()
        
        # Remover técnico
        db.session.delete(tecnico)
        db.session.commit()
        
        return jsonify({'mensagem': 'Técnico excluído com sucesso'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

@tecnicos_bp.route('/<int:id>/desempenho', methods=['GET'])
def desempenho_tecnico(id):
    """Obtém métricas de desempenho de um técnico específico"""
    # Verificar se o técnico existe
    tecnico = Tecnico.query.get_or_404(id)
    
    # Parâmetros de filtro
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    
    # Consulta base para ordens de serviço do técnico
    query = OrdemServico.query.filter(
        (OrdemServico.tecnico_campo_id == id) | 
        (OrdemServico.tecnico_app_id == id)
    )
    
    # Aplicar filtros de data
    if data_inicio:
        from datetime import datetime
        data_inicio = datetime.fromisoformat(data_inicio)
        query = query.filter(OrdemServico.data_criacao >= data_inicio)
    if data_fim:
        from datetime import datetime
        data_fim = datetime.fromisoformat(data_fim)
        query = query.filter(OrdemServico.data_criacao <= data_fim)
    
    # Total de ordens
    total_ordens = query.count()
    
    # Total por status
    total_por_status = db.session.query(
        OrdemServico.status, 
        func.count(OrdemServico.id)
    ).filter(
        (OrdemServico.tecnico_campo_id == id) | 
        (OrdemServico.tecnico_app_id == id)
    ).group_by(OrdemServico.status).all()
    
    # Total instaladas
    total_instaladas = query.filter(OrdemServico.status == 'INSTALADA').count()
    
    # Taxa de conclusão
    taxa_conclusao = (total_instaladas / total_ordens) * 100 if total_ordens > 0 else 0
    
    # Resultado
    metricas = {
        'nome_tecnico': tecnico.nome,
        'total_ordens': total_ordens,
        'total_instaladas': total_instaladas,
        'taxa_conclusao': round(taxa_conclusao, 2),
        'por_status': {status: total for status, total in total_por_status}
    }
    
    return jsonify(metricas)
