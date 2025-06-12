from flask import Blueprint, request, jsonify
from app.models import Cliente, Cidade, Contato
from app import db

clientes_bp = Blueprint('clientes', __name__)

@clientes_bp.route('/', methods=['GET'])
def listar_clientes():
    """Lista todos os clientes com filtros opcionais"""
    # Parâmetros de filtro
    nome = request.args.get('nome')
    cidade_id = request.args.get('cidade_id')
    
    # Consulta base
    query = Cliente.query
    
    # Aplicar filtros
    if nome:
        query = query.filter(Cliente.nome_completo.ilike(f'%{nome}%'))
    if cidade_id:
        query = query.filter(Cliente.cidade_id == cidade_id)
    
    # Executar consulta
    clientes = query.all()
    
    # Converter para dicionários
    resultado = [cliente.to_dict() for cliente in clientes]
    
    return jsonify(resultado)

@clientes_bp.route('/<int:id>', methods=['GET'])
def obter_cliente(id):
    """Obtém detalhes de um cliente específico"""
    cliente = Cliente.query.get_or_404(id)
    
    # Obter contatos do cliente
    contatos = Contato.query.filter_by(entidade_tipo='cliente', entidade_id=id).all()
    contatos_dict = [contato.to_dict() for contato in contatos]
    
    # Montar resposta
    resultado = cliente.to_dict()
    resultado['contatos'] = contatos_dict
    
    return jsonify(resultado)

@clientes_bp.route('/', methods=['POST'])
def criar_cliente():
    """Cria um novo cliente"""
    dados = request.json
    
    # Validar dados obrigatórios
    campos_obrigatorios = ['nome_completo', 'endereco', 'bairro', 'cidade_id', 'uf']
    for campo in campos_obrigatorios:
        if campo not in dados:
            return jsonify({'erro': f'Campo obrigatório ausente: {campo}'}), 400
    
    # Criar novo cliente
    novo_cliente = Cliente(
        nome_completo=dados['nome_completo'],
        cpf=dados.get('cpf'),
        endereco=dados['endereco'],
        bairro=dados['bairro'],
        cidade_id=dados['cidade_id'],
        uf=dados['uf'],
        cep=dados.get('cep'),
        ponto_referencia=dados.get('ponto_referencia')
    )
    
    # Salvar no banco de dados
    db.session.add(novo_cliente)
    
    try:
        db.session.commit()
        
        # Adicionar contatos, se fornecidos
        if 'contatos' in dados and isinstance(dados['contatos'], list):
            for contato_dados in dados['contatos']:
                contato = Contato(
                    entidade_tipo='cliente',
                    entidade_id=novo_cliente.id,
                    tipo=contato_dados['tipo'],
                    valor=contato_dados['valor'],
                    principal=contato_dados.get('principal', False)
                )
                db.session.add(contato)
            
            db.session.commit()
        
        # Obter cliente com contatos
        resultado = novo_cliente.to_dict()
        contatos = Contato.query.filter_by(entidade_tipo='cliente', entidade_id=novo_cliente.id).all()
        resultado['contatos'] = [contato.to_dict() for contato in contatos]
        
        return jsonify(resultado), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

@clientes_bp.route('/<int:id>', methods=['PUT'])
def atualizar_cliente(id):
    """Atualiza um cliente existente"""
    cliente = Cliente.query.get_or_404(id)
    dados = request.json
    
    # Atualizar campos
    if 'nome_completo' in dados:
        cliente.nome_completo = dados['nome_completo']
    if 'cpf' in dados:
        cliente.cpf = dados['cpf']
    if 'endereco' in dados:
        cliente.endereco = dados['endereco']
    if 'bairro' in dados:
        cliente.bairro = dados['bairro']
    if 'cidade_id' in dados:
        cliente.cidade_id = dados['cidade_id']
    if 'uf' in dados:
        cliente.uf = dados['uf']
    if 'cep' in dados:
        cliente.cep = dados['cep']
    if 'ponto_referencia' in dados:
        cliente.ponto_referencia = dados['ponto_referencia']
    
    # Salvar alterações
    try:
        db.session.commit()
        
        # Atualizar contatos, se fornecidos
        if 'contatos' in dados and isinstance(dados['contatos'], list):
            # Remover contatos existentes
            Contato.query.filter_by(entidade_tipo='cliente', entidade_id=id).delete()
            
            # Adicionar novos contatos
            for contato_dados in dados['contatos']:
                contato = Contato(
                    entidade_tipo='cliente',
                    entidade_id=cliente.id,
                    tipo=contato_dados['tipo'],
                    valor=contato_dados['valor'],
                    principal=contato_dados.get('principal', False)
                )
                db.session.add(contato)
            
            db.session.commit()
        
        # Obter cliente atualizado com contatos
        resultado = cliente.to_dict()
        contatos = Contato.query.filter_by(entidade_tipo='cliente', entidade_id=cliente.id).all()
        resultado['contatos'] = [contato.to_dict() for contato in contatos]
        
        return jsonify(resultado)
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

@clientes_bp.route('/<int:id>', methods=['DELETE'])
def excluir_cliente(id):
    """Exclui um cliente"""
    cliente = Cliente.query.get_or_404(id)
    
    try:
        # Remover contatos associados
        Contato.query.filter_by(entidade_tipo='cliente', entidade_id=id).delete()
        
        # Remover cliente
        db.session.delete(cliente)
        db.session.commit()
        
        return jsonify({'mensagem': 'Cliente excluído com sucesso'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 400

@clientes_bp.route('/busca', methods=['GET'])
def buscar_cliente():
    """Busca clientes por nome, CPF ou contato"""
    termo = request.args.get('termo', '')
    
    if not termo or len(termo) < 3:
        return jsonify({'erro': 'Termo de busca deve ter pelo menos 3 caracteres'}), 400
    
    # Buscar por nome ou CPF
    clientes_por_nome_cpf = Cliente.query.filter(
        (Cliente.nome_completo.ilike(f'%{termo}%')) | 
        (Cliente.cpf.ilike(f'%{termo}%'))
    ).all()
    
    # Buscar por contato
    contatos = Contato.query.filter(
        (Contato.entidade_tipo == 'cliente') & 
        (Contato.valor.ilike(f'%{termo}%'))
    ).all()
    
    clientes_por_contato = []
    for contato in contatos:
        cliente = Cliente.query.get(contato.entidade_id)
        if cliente and cliente not in clientes_por_nome_cpf:
            clientes_por_contato.append(cliente)
    
    # Combinar resultados
    todos_clientes = clientes_por_nome_cpf + clientes_por_contato
    
    # Converter para dicionários
    resultado = [cliente.to_dict() for cliente in todos_clientes]
    
    return jsonify(resultado)
