import json
import os
from app import create_app, db
from app.models.cidade import Cidade
from app.models.cliente import Cliente
from app.models.tecnico import Tecnico
from app.models.ordem_servico import OrdemServico

def seed_data():
    app = create_app()
    with app.app_context():
        db.create_all()

        # Caminho base para os arquivos JSON
        base_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'assets')

        # Seed Cidades
        cidades_path = os.path.join(base_path, 'dados_cidades.json')
        if os.path.exists(cidades_path):
            with open(cidades_path) as f:
                data = json.load(f)
                for item in data:
                    cidade = Cidade(nome=item.get('cidade', ''), estado=item.get('estado', ''))
                    db.session.add(cidade)
            db.session.commit()
            print("Cidades populadas com sucesso!")

        # Seed Tecnicos
        tecnicos_path = os.path.join(base_path, 'dados_tecnicos_count.json')
        if os.path.exists(tecnicos_path):
            with open(tecnicos_path) as f:
                data = json.load(f)
                for item in data:
                    tecnico = Tecnico(nome=item.get('tecnico', ''), especialidade='Geral')
                    db.session.add(tecnico)
            db.session.commit()
            print("Técnicos populados com sucesso!")

        # Seed Clientes (exemplo)
        cliente_exemplo = Cliente(nome='Cliente Exemplo', endereco='Rua Exemplo, 123', telefone='(11) 99999-9999')
        db.session.add(cliente_exemplo)
        db.session.commit()
        print("Clientes populados com sucesso!")

        # Seed Ordens de Serviço
        ordens_path = os.path.join(base_path, 'dados_os.json')
        if os.path.exists(ordens_path):
            with open(ordens_path) as f:
                data = json.load(f)
                for item in data:
                    # Encontrar cidade e técnico existentes ou criar novos se necessário
                    cidade = Cidade.query.filter_by(nome=item.get('cidade', '')).first()
                    if not cidade:
                        cidade = Cidade(nome=item.get('cidade', ''), estado='Desconhecido')
                        db.session.add(cidade)
                        db.session.commit()

                    tecnico = Tecnico.query.filter_by(nome=item.get('tecnico', '')).first()
                    if not tecnico:
                        tecnico = Tecnico(nome=item.get('tecnico', ''), especialidade='Geral')
                        db.session.add(tecnico)
                        db.session.commit()

                    # Cliente associado à OS
                    cliente = Cliente.query.first()

                    ordem_servico = OrdemServico(
                        data_abertura=item.get('data_abertura', ''),
                        status=item.get('status', ''),
                        descricao=item.get('descricao', ''),
                        cliente_id=cliente.id if cliente else None,
                        tecnico_id=tecnico.id if tecnico else None,
                        cidade_id=cidade.id if cidade else None
                    )
                    db.session.add(ordem_servico)
            db.session.commit()
            print("Ordens de Serviço populadas com sucesso!")

if __name__ == '__main__':
    seed_data()


