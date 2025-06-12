from flask import Blueprint, request, jsonify, send_file
from app.models import OrdemServico, Cliente, Tecnico, Cidade
from app import db
import pandas as pd
import io
import tempfile
from datetime import datetime
from weasyprint import HTML, CSS
from sqlalchemy import func

relatorios_bp = Blueprint('relatorios', __name__)

@relatorios_bp.route('/tecnicos/pdf', methods=['GET'])
def relatorio_tecnicos_pdf():
    """Gera relatório PDF para técnicos com ordens de serviço pendentes"""
    # Parâmetros
    tecnico_id = request.args.get('tecnico_id', type=int)
    cidade_id = request.args.get('cidade_id', type=int)
    dias = request.args.get('dias', 30, type=int)
    
    # Consulta base
    query = OrdemServico.query.filter(OrdemServico.status != 'INSTALADA')
    
    # Aplicar filtros
    if tecnico_id:
        query = query.filter(OrdemServico.tecnico_campo_id == tecnico_id)
    if cidade_id:
        query = query.filter(OrdemServico.cidade_id == cidade_id)
    
    # Ordenar por data de vencimento
    query = query.order_by(OrdemServico.data_vencimento)
    
    # Executar consulta
    ordens = query.all()
    
    # Preparar dados para o relatório
    dados_relatorio = []
    for ordem in ordens:
        cliente = Cliente.query.get(ordem.cliente_id)
        tecnico = Tecnico.query.get(ordem.tecnico_campo_id)
        cidade = Cidade.query.get(ordem.cidade_id)
        
        # Obter contato principal do cliente
        contato_principal = db.session.query(Contato).filter(
            Contato.entidade_tipo == 'cliente',
            Contato.entidade_id == cliente.id,
            Contato.principal == True
        ).first()
        
        if not contato_principal:
            # Se não houver contato principal, pegar o primeiro
            contato_principal = db.session.query(Contato).filter(
                Contato.entidade_tipo == 'cliente',
                Contato.entidade_id == cliente.id
            ).first()
        
        contato_valor = contato_principal.valor if contato_principal else "Sem contato"
        
        dados_relatorio.append({
            'numero_os': ordem.numero_os,
            'cliente': cliente.nome_completo,
            'contato': contato_valor,
            'endereco': f"{cliente.endereco}, {cliente.bairro}, {cidade.nome}-{cidade.uf}",
            'referencia': cliente.ponto_referencia or "Sem referência",
            'tecnico': tecnico.nome,
            'data_vencimento': ordem.data_vencimento.strftime('%d/%m/%Y') if ordem.data_vencimento else "Sem data",
            'status': ordem.status
        })
    
    # Gerar HTML para o relatório
    titulo_relatorio = "Relatório de Ordens de Serviço Pendentes"
    if tecnico_id:
        tecnico = Tecnico.query.get(tecnico_id)
        titulo_relatorio += f" - Técnico: {tecnico.nome}"
    if cidade_id:
        cidade = Cidade.query.get(cidade_id)
        titulo_relatorio += f" - Cidade: {cidade.nome}-{cidade.uf}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>{titulo_relatorio}</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            h1 {{ color: #333366; font-size: 18px; text-align: center; margin-bottom: 20px; }}
            table {{ width: 100%; border-collapse: collapse; }}
            th {{ background-color: #333366; color: white; padding: 8px; text-align: left; font-size: 12px; }}
            td {{ padding: 8px; border-bottom: 1px solid #ddd; font-size: 11px; }}
            tr:nth-child(even) {{ background-color: #f2f2f2; }}
            .data-vencimento {{ color: red; font-weight: bold; }}
            .footer {{ margin-top: 20px; text-align: center; font-size: 10px; color: #666; }}
        </style>
    </head>
    <body>
        <h1>{titulo_relatorio}</h1>
        <table>
            <tr>
                <th>O.S.</th>
                <th>Cliente</th>
                <th>Contato</th>
                <th>Endereço</th>
                <th>Referência</th>
                <th>Técnico</th>
                <th>Vencimento</th>
                <th>Status</th>
            </tr>
    """
    
    for item in dados_relatorio:
        html_content += f"""
            <tr>
                <td>{item['numero_os']}</td>
                <td>{item['cliente']}</td>
                <td>{item['contato']}</td>
                <td>{item['endereco']}</td>
                <td>{item['referencia']}</td>
                <td>{item['tecnico']}</td>
                <td class="data-vencimento">{item['data_vencimento']}</td>
                <td>{item['status']}</td>
            </tr>
        """
    
    html_content += f"""
        </table>
        <div class="footer">
            Relatório gerado em {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
        </div>
    </body>
    </html>
    """
    
    # Gerar PDF
    pdf = HTML(string=html_content).write_pdf()
    
    # Criar arquivo temporário
    pdf_file = io.BytesIO()
    pdf_file.write(pdf)
    pdf_file.seek(0)
    
    # Nome do arquivo
    filename = f"relatorio_os_pendentes_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    # Retornar o arquivo
    return send_file(
        pdf_file,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=filename
    )

@relatorios_bp.route('/admin/csv', methods=['GET'])
def relatorio_admin_csv():
    """Gera relatório CSV para administração"""
    # Parâmetros
    tipo = request.args.get('tipo', 'os')  # os, tecnicos, cidades
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    
    # Converter datas
    if data_inicio:
        data_inicio = datetime.fromisoformat(data_inicio)
    if data_fim:
        data_fim = datetime.fromisoformat(data_fim)
    
    # Gerar relatório conforme o tipo
    if tipo == 'os':
        # Relatório de ordens de serviço
        query = db.session.query(
            OrdemServico.numero_os,
            OrdemServico.status,
            OrdemServico.data_criacao,
            OrdemServico.data_instalacao,
            OrdemServico.data_vencimento,
            Cliente.nome_completo.label('cliente'),
            Cliente.endereco,
            Cliente.bairro,
            Cidade.nome.label('cidade'),
            Cidade.uf,
            Tecnico.nome.label('tecnico')
        ).join(
            Cliente, OrdemServico.cliente_id == Cliente.id
        ).join(
            Cidade, OrdemServico.cidade_id == Cidade.id
        ).join(
            Tecnico, OrdemServico.tecnico_campo_id == Tecnico.id
        )
        
        # Aplicar filtros de data
        if data_inicio:
            query = query.filter(OrdemServico.data_criacao >= data_inicio)
        if data_fim:
            query = query.filter(OrdemServico.data_criacao <= data_fim)
        
        # Executar consulta
        resultados = query.all()
        
        # Converter para DataFrame
        df = pd.DataFrame(resultados, columns=[
            'Número OS', 'Status', 'Data Criação', 'Data Instalação', 'Data Vencimento',
            'Cliente', 'Endereço', 'Bairro', 'Cidade', 'UF', 'Técnico'
        ])
        
        # Formatar datas
        df['Data Criação'] = df['Data Criação'].dt.strftime('%d/%m/%Y')
        df['Data Instalação'] = df['Data Instalação'].dt.strftime('%d/%m/%Y')
        df['Data Vencimento'] = df['Data Vencimento'].dt.strftime('%d/%m/%Y')
        
        filename = f"relatorio_ordens_servico_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    elif tipo == 'tecnicos':
        # Relatório de desempenho por técnico
        subquery = db.session.query(
            OrdemServico.tecnico_campo_id,
            func.count(OrdemServico.id).label('total_os'),
            func.sum(case((OrdemServico.status == 'INSTALADA', 1), else_=0)).label('total_instaladas')
        )
        
        # Aplicar filtros de data
        if data_inicio:
            subquery = subquery.filter(OrdemServico.data_criacao >= data_inicio)
        if data_fim:
            subquery = subquery.filter(OrdemServico.data_criacao <= data_fim)
        
        # Agrupar por técnico
        subquery = subquery.group_by(OrdemServico.tecnico_campo_id).subquery()
        
        # Consulta principal
        query = db.session.query(
            Tecnico.nome,
            Tecnico.identificacao_campo,
            Tecnico.identificacao_app,
            subquery.c.total_os,
            subquery.c.total_instaladas,
            (100 * subquery.c.total_instaladas / subquery.c.total_os).label('taxa_conclusao')
        ).join(
            subquery, Tecnico.id == subquery.c.tecnico_campo_id
        )
        
        # Executar consulta
        resultados = query.all()
        
        # Converter para DataFrame
        df = pd.DataFrame(resultados, columns=[
            'Nome', 'Identificação Campo', 'Identificação App',
            'Total OS', 'Total Instaladas', 'Taxa Conclusão (%)'
        ])
        
        # Formatar taxa de conclusão
        df['Taxa Conclusão (%)'] = df['Taxa Conclusão (%)'].round(2)
        
        filename = f"relatorio_desempenho_tecnicos_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    elif tipo == 'cidades':
        # Relatório por cidade
        subquery = db.session.query(
            OrdemServico.cidade_id,
            func.count(OrdemServico.id).label('total_os'),
            func.sum(case((OrdemServico.status == 'INSTALADA', 1), else_=0)).label('total_instaladas')
        )
        
        # Aplicar filtros de data
        if data_inicio:
            subquery = subquery.filter(OrdemServico.data_criacao >= data_inicio)
        if data_fim:
            subquery = subquery.filter(OrdemServico.data_criacao <= data_fim)
        
        # Agrupar por cidade
        subquery = subquery.group_by(OrdemServico.cidade_id).subquery()
        
        # Consulta principal
        query = db.session.query(
            Cidade.nome,
            Cidade.uf,
            Cidade.regiao,
            subquery.c.total_os,
            subquery.c.total_instaladas,
            (100 * subquery.c.total_instaladas / subquery.c.total_os).label('taxa_conclusao')
        ).join(
            subquery, Cidade.id == subquery.c.cidade_id
        )
        
        # Executar consulta
        resultados = query.all()
        
        # Converter para DataFrame
        df = pd.DataFrame(resultados, columns=[
            'Cidade', 'UF', 'Região', 'Total OS', 'Total Instaladas', 'Taxa Conclusão (%)'
        ])
        
        # Formatar taxa de conclusão
        df['Taxa Conclusão (%)'] = df['Taxa Conclusão (%)'].round(2)
        
        filename = f"relatorio_desempenho_cidades_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    else:
        return jsonify({'erro': f'Tipo de relatório inválido: {tipo}'}), 400
    
    # Criar arquivo CSV
    csv_file = io.StringIO()
    df.to_csv(csv_file, index=False, sep=';')
    csv_file.seek(0)
    
    # Converter para bytes
    csv_bytes = io.BytesIO()
    csv_bytes.write(csv_file.getvalue().encode('utf-8-sig'))  # UTF-8 com BOM para Excel
    csv_bytes.seek(0)
    
    # Retornar o arquivo
    return send_file(
        csv_bytes,
        mimetype='text/csv',
        as_attachment=True,
        download_name=filename
    )

@relatorios_bp.route('/admin/pdf', methods=['GET'])
def relatorio_admin_pdf():
    """Gera relatório PDF para administração"""
    # Parâmetros
    tipo = request.args.get('tipo', 'resumo')  # resumo, tecnicos, cidades
    data_inicio = request.args.get('data_inicio')
    data_fim = request.args.get('data_fim')
    
    # Converter datas
    if data_inicio:
        data_inicio = datetime.fromisoformat(data_inicio)
    if data_fim:
        data_fim = datetime.fromisoformat(data_fim)
    
    # Título e período do relatório
    titulo_relatorio = "Relatório Administrativo"
    periodo = ""
    if data_inicio and data_fim:
        periodo = f"Período: {data_inicio.strftime('%d/%m/%Y')} a {data_fim.strftime('%d/%m/%Y')}"
    elif data_inicio:
        periodo = f"A partir de: {data_inicio.strftime('%d/%m/%Y')}"
    elif data_fim:
        periodo = f"Até: {data_fim.strftime('%d/%m/%Y')}"
    
    # Gerar relatório conforme o tipo
    if tipo == 'resumo':
        # Consulta para total de ordens
        query_total = OrdemServico.query
        if data_inicio:
            query_total = query_total.filter(OrdemServico.data_criacao >= data_inicio)
        if data_fim:
            query_total = query_total.filter(OrdemServico.data_criacao <= data_fim)
        total_ordens = query_total.count()
        
        # Consulta para total por status
        query_status = db.session.query(
            OrdemServico.status,
            func.count(OrdemServico.id).label('total')
        )
        if data_inicio:
            query_status = query_status.filter(OrdemServico.data_criacao >= data_inicio)
        if data_fim:
            query_status = query_status.filter(OrdemServico.data_criacao <= data_fim)
        status_counts = query_status.group_by(OrdemServico.status).all()
        
        # Consulta para top 5 técnicos
        query_tecnicos = db.session.query(
            Tecnico.nome,
            func.count(OrdemServico.id).label('total')
        ).join(
            OrdemServico, OrdemServico.tecnico_campo_id == Tecnico.id
        )
        if data_inicio:
            query_tecnicos = query_tecnicos.filter(OrdemServico.data_criacao >= data_inicio)
        if data_fim:
            query_tecnicos = query_tecnicos.filter(OrdemServico.data_criacao <= data_fim)
        top_tecnicos = query_tecnicos.group_by(Tecnico.nome).order_by(func.count(OrdemServico.id).desc()).limit(5).all()
        
        # Consulta para top 5 cidades
        query_cidades = db.session.query(
            Cidade.nome,
            Cidade.uf,
            func.count(OrdemServico.id).label('total')
        ).join(
            OrdemServico, OrdemServico.cidade_id == Cidade.id
        )
        if data_inicio:
            query_cidades = query_cidades.filter(OrdemServico.data_criacao >= data_inicio)
        if data_fim:
            query_cidades = query_cidades.filter(OrdemServico.data_criacao <= data_fim)
        top_cidades = query_cidades.group_by(Cidade.nome, Cidade.uf).order_by(func.count(OrdemServico.id).desc()).limit(5).all()
        
        # Gerar HTML para o relatório
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{titulo_relatorio}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                h1 {{ color: #333366; font-size: 18px; text-align: center; margin-bottom: 10px; }}
                h2 {{ color: #333366; font-size: 14px; margin-top: 20px; }}
                p {{ margin: 5px 0; }}
                table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; }}
                th {{ background-color: #333366; color: white; padding: 8px; text-align: left; font-size: 12px; }}
                td {{ padding: 8px; border-bottom: 1px solid #ddd; font-size: 11px; }}
                tr:nth-child(even) {{ background-color: #f2f2f2; }}
                .footer {{ margin-top: 20px; text-align: center; font-size: 10px; color: #666; }}
                .resumo {{ background-color: #f9f9f9; padding: 10px; border: 1px solid #ddd; margin-bottom: 20px; }}
            </style>
        </head>
        <body>
            <h1>{titulo_relatorio}</h1>
            <p style="text-align: center;">{periodo}</p>
            
            <div class="resumo">
                <h2>Resumo Geral</h2>
                <p><strong>Total de Ordens de Serviço:</strong> {total_ordens}</p>
        """
        
        # Adicionar total por status
        html_content += "<table><tr><th>Status</th><th>Quantidade</th><th>Percentual</th></tr>"
        for status, total in status_counts:
            percentual = (total / total_ordens) * 100 if total_ordens > 0 else 0
            htm
(Content truncated due to size limit. Use line ranges to read in chunks)