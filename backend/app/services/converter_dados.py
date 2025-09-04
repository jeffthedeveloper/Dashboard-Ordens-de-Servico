import pandas as pd
import json
import os

# Diretório de saída para os arquivos JSON
output_dir = os.path.dirname(os.path.abspath(__file__))

# Caminho do arquivo Excel
excel_file = '/home/ubuntu/upload/PLANILHA GERAL O.S MAIO COM PAINEL G-DRIVE-ATT .xlsx'

# Converter dados da aba CONSOLIDADO
try:
    df_consolidado = pd.read_excel(excel_file, sheet_name='CONSOLIDADO')
    df_consolidado.columns = [
        'status', 'data', 'os', 'tecnico_campo', 'fez_rua', 'baixou_app', 
        'tecnico_app', 'nome_cliente', 'celular', 'endereco', 'bairro', 
        'cidade', 'uf', 'referencia', 'cpf', 'cep'
    ]
    df_consolidado = df_consolidado.fillna('')
    df_consolidado['data'] = df_consolidado['data'].astype(str)
    json_data = df_consolidado.to_dict(orient='records')
    
    with open(os.path.join(output_dir, 'dados_os.json'), 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=2)
    print('Arquivo JSON de OS criado com sucesso')
except Exception as e:
    print(f"Erro ao processar aba CONSOLIDADO: {e}")

# Converter dados da aba TÉCNICOS
try:
    df_tecnicos = pd.read_excel(excel_file, sheet_name='TÉCNICOS')
    df_tecnicos = df_tecnicos.fillna('')
    json_tecnicos = df_tecnicos.to_dict(orient='records')
    
    with open(os.path.join(output_dir, 'dados_tecnicos.json'), 'w', encoding='utf-8') as f:
        json.dump(json_tecnicos, f, ensure_ascii=False, indent=2)
    print('Arquivo JSON de técnicos criado com sucesso')
except Exception as e:
    print(f"Erro ao processar aba TÉCNICOS: {e}")

# Converter dados da aba CONTAGEM DE KITS E INSTALAÇÕES
try:
    df_kits = pd.read_excel(excel_file, sheet_name='CONTAGEM DE KITS E INSTALAÇÕES-')
    df_kits = df_kits.fillna('')
    json_kits = df_kits.to_dict(orient='records')
    
    with open(os.path.join(output_dir, 'dados_kits.json'), 'w', encoding='utf-8') as f:
        json.dump(json_kits, f, ensure_ascii=False, indent=2)
    print('Arquivo JSON de kits criado com sucesso')
except Exception as e:
    print(f"Erro ao processar aba CONTAGEM DE KITS E INSTALAÇÕES-: {e}")

# Gerar dados agregados para o dashboard
try:
    # Dados por cidade
    cidades = df_consolidado['cidade'].unique()
    dados_cidades = []
    
    for cidade in cidades:
        if cidade:  # Ignorar valores vazios
            count = len(df_consolidado[df_consolidado['cidade'] == cidade])
            dados_cidades.append({'cidade': cidade, 'total': count})
    
    with open(os.path.join(output_dir, 'dados_cidades.json'), 'w', encoding='utf-8') as f:
        json.dump(dados_cidades, f, ensure_ascii=False, indent=2)
    
    # Dados por técnico
    tecnicos = df_consolidado['tecnico_campo'].unique()
    dados_tecnicos_count = []
    
    for tecnico in tecnicos:
        if tecnico:  # Ignorar valores vazios
            count = len(df_consolidado[df_consolidado['tecnico_campo'] == tecnico])
            dados_tecnicos_count.append({'tecnico': tecnico, 'total': count})
    
    with open(os.path.join(output_dir, 'dados_tecnicos_count.json'), 'w', encoding='utf-8') as f:
        json.dump(dados_tecnicos_count, f, ensure_ascii=False, indent=2)
    
    # Dados por data
    df_consolidado['data_formatada'] = pd.to_datetime(df_consolidado['data'], errors='coerce')
    df_consolidado['data_formatada'] = df_consolidado['data_formatada'].dt.strftime('%Y-%m-%d')
    
    datas = df_consolidado['data_formatada'].dropna().unique()
    dados_datas = []
    
    for data in datas:
        if data:  # Ignorar valores vazios
            count = len(df_consolidado[df_consolidado['data_formatada'] == data])
            dados_datas.append({'data': data, 'total': count})
    
    with open(os.path.join(output_dir, 'dados_datas.json'), 'w', encoding='utf-8') as f:
        json.dump(dados_datas, f, ensure_ascii=False, indent=2)
    
    print('Arquivos JSON de dados agregados criados com sucesso')
except Exception as e:
    print(f"Erro ao gerar dados agregados: {e}")
