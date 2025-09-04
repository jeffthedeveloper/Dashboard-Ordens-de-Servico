from flask import Blueprint, request, jsonify
from app.models import Cidade
from app import db

cidades_bp = Blueprint('cidades', __name__)

@cidades_bp.route('/', methods=['GET'])
def listar_cidades():
    """Lista todas as cidades com filtros opcionais"""
    # Parâmetros de filtro
    uf = request.args.get('uf')
    regiao = request.args.get('regiao')
    
    # Consulta base
    query = Cidade.query
    
    # Aplicar filtros
    if uf:
        query = query.filter(Cidade.uf == uf.upper())
    if regiao:
        query = query.filter(Cidade.regiao.ilike(f'%{regiao}%'))
    
    # Executar consulta
    cidades = query.all()
    
    # Converter para dicionários
    resultado = [cidade.to_dict() for cidade in cidades]
    
    return jsonify(resultado)

@cidades_bp.route('/<int:id>', methods=['GET'])
def obter_cidade(id):
    """Obtém detalhes de uma cidade específica"""
    cidade = Cidade.query.get_or_404(id)
    return jsonify(cidade.to_dict())

@cidades_bp.route('/', methods=['POST'])
def criar_cidade():
    """Cria uma nova cidade"""
    dados = request.json
    
    # Validar dados obrigatórios
    campos_obrigatorios = ['nome', 'uf']
    for campo in campos_obrigatorios:
        if campo not in dados:
            return jsonify({'erro': f'Campo obrigatório ausente: {campo}'}), 400
    
    # Normalizar UF para maiúsculas
    uf = dados['uf'].upper()
    
    # Verificar se a cidade já existe
    cidade_existente = Cidade.query.filter_by(nome=dados['nome'], uf=uf).first()
    if cidade_existente:
        return jsonify({'erro': f'Cidade {dados["nome"]}-{uf} já existe'}), 400
    
    # Criar nova cidade
    nova_cidade = Cidade(
        nome=dados['nome'],
        uf=uf,
        regiao=dados.get('regiao')
    )
    
    # Salvar no banco de dados
    db.session.add(nova_cidade)
    
    try:
        db.session.commit()
        return jsonify(nova_cidade.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

@cidades_bp.route('/<int:id>', methods=['PUT'])
def atualizar_cidade(id):
    """Atualiza uma cidade existente"""
    cidade = Cidade.query.get_or_404(id)
    dados = request.json
    
    # Atualizar campos
    if 'nome' in dados:
        cidade.nome = dados['nome']
    if 'uf' in dados:
        cidade.uf = dados['uf'].upper()
    if 'regiao' in dados:
        cidade.regiao = dados['regiao']
    
    # Salvar alterações
    try:
        db.session.commit()
        return jsonify(cidade.to_dict())
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

@cidades_bp.route('/<int:id>', methods=['DELETE'])
def excluir_cidade(id):
    """Exclui uma cidade"""
    cidade = Cidade.query.get_or_404(id)
    
    try:
        # Verificar se há clientes ou ordens de serviço associadas
        from app.models import Cliente, OrdemServico
        
        clientes_count = Cliente.query.filter_by(cidade_id=id).count()
        ordens_count = OrdemServico.query.filter_by(cidade_id=id).count()
        
        if clientes_count > 0 or ordens_count > 0:
            return jsonify({
                'erro': f'Não é possível excluir a cidade pois existem {clientes_count} clientes e {ordens_count} ordens de serviço associadas'
            }), 400
        
        # Remover cidade
        db.session.delete(cidade)
        db.session.commit()
        
        return jsonify({'mensagem': 'Cidade excluída com sucesso'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

@cidades_bp.route('/ufs', methods=['GET'])
def listar_ufs():
    """Lista todas as UFs disponíveis"""
    from sqlalchemy import func
    
    ufs = db.session.query(func.distinct(Cidade.uf)).order_by(Cidade.uf).all()
    resultado = [uf[0] for uf in ufs]
    
    return jsonify(resultado)

@cidades_bp.route('/regioes', methods=['GET'])
def listar_regioes():
    """Lista todas as regiões disponíveis"""
    from sqlalchemy import func
    
    regioes = db.session.query(func.distinct(Cidade.regiao)).filter(Cidade.regiao != None).order_by(Cidade.regiao).all()
    resultado = [regiao[0] for regiao in regioes if regiao[0]]
    
    return jsonify(resultado)
