# Modelo de Dados Detalhado para Dashboard de Ordens de Serviço - Versão 2.0

## Entidades e Atributos

### 1. Ordens de Serviço (ordens_servico)
- **id**: Integer, PK, Auto-increment
- **numero_os**: String, Unique, Not Null (ex: "9003.0")
- **status**: String, Not Null (ex: "INSTALADA", "PENDENTE", "CANCELADA")
- **data_criacao**: DateTime, Not Null
- **data_instalacao**: DateTime, Nullable
- **data_vencimento**: DateTime, Not Null (prazo máximo para instalação)
- **cliente_id**: Integer, FK -> clientes.id, Not Null
- **tecnico_campo_id**: Integer, FK -> tecnicos.id, Not Null
- **tecnico_app_id**: Integer, FK -> tecnicos.id, Nullable
- **cidade_id**: Integer, FK -> cidades.id, Not Null
- **fez_na_rua**: Boolean, Default False
- **baixou_no_app**: Boolean, Default False
- **observacoes**: Text, Nullable
- **created_at**: DateTime, Not Null (data de registro no sistema)
- **updated_at**: DateTime, Not Null (data da última atualização)

### 2. Clientes (clientes)
- **id**: Integer, PK, Auto-increment
- **nome_completo**: String, Not Null
- **cpf**: String, Unique, Nullable
- **endereco**: String, Not Null
- **bairro**: String, Not Null
- **cidade_id**: Integer, FK -> cidades.id, Not Null
- **uf**: String, Not Null
- **cep**: String, Nullable
- **ponto_referencia**: Text, Nullable
- **created_at**: DateTime, Not Null
- **updated_at**: DateTime, Not Null

### 3. Contatos (contatos)
- **id**: Integer, PK, Auto-increment
- **entidade_tipo**: String, Not Null (ex: "cliente", "tecnico", "fornecedor")
- **entidade_id**: Integer, Not Null
- **tipo**: String, Not Null (ex: "telefone", "celular", "whatsapp", "email", "instagram")
- **valor**: String, Not Null
- **principal**: Boolean, Default False
- **created_at**: DateTime, Not Null
- **updated_at**: DateTime, Not Null

### 4. Técnicos (tecnicos)
- **id**: Integer, PK, Auto-increment
- **nome**: String, Not Null
- **identificacao_campo**: String, Nullable (ex: "OZINALDO")
- **identificacao_app**: String, Nullable (ex: "JACKSON HENRIQUES")
- **ativo**: Boolean, Default True
- **created_at**: DateTime, Not Null
- **updated_at**: DateTime, Not Null

### 5. Cidades (cidades)
- **id**: Integer, PK, Auto-increment
- **nome**: String, Not Null
- **uf**: String, Not Null
- **regiao**: String, Nullable
- **created_at**: DateTime, Not Null
- **updated_at**: DateTime, Not Null

### 6. Fornecedores (fornecedores)
- **id**: Integer, PK, Auto-increment
- **nome**: String, Not Null
- **tipo**: String, Not Null (ex: "Elsys", "Intelbrás")
- **created_at**: DateTime, Not Null
- **updated_at**: DateTime, Not Null

### 7. Kits (kits)
- **id**: Integer, PK, Auto-increment
- **fornecedor_id**: Integer, FK -> fornecedores.id, Not Null
- **serial**: String, Unique, Not Null
- **status**: String, Not Null (ex: "disponível", "alocado", "instalado")
- **tecnico_id**: Integer, FK -> tecnicos.id, Nullable
- **ordem_servico_id**: Integer, FK -> ordens_servico.id, Nullable
- **data_alocacao**: DateTime, Nullable
- **data_instalacao**: DateTime, Nullable
- **created_at**: DateTime, Not Null
- **updated_at**: DateTime, Not Null

### 8. Componentes (componentes)
- **id**: Integer, PK, Auto-increment
- **kit_id**: Integer, FK -> kits.id, Not Null
- **tipo**: String, Not Null (ex: "antena", "parábola", "lnb", "conector", "parafuso", "haste", "cabo")
- **quantidade**: Integer, Not Null
- **created_at**: DateTime, Not Null
- **updated_at**: DateTime, Not Null

## Métricas Operacionais Prioritárias

### 1. Acompanhamento de Ordens de Serviço
- **Total de O.S. por status**: Contagem de O.S. agrupadas por status
- **Taxa de conclusão**: (O.S. instaladas / total de O.S.) * 100
- **O.S. próximas do vencimento**: O.S. com data_vencimento próxima da data atual
- **Tempo médio de instalação**: Média de (data_instalacao - data_criacao) para O.S. instaladas

### 2. Desempenho por Técnico
- **Total de instalações por técnico**: Contagem de O.S. instaladas por técnico
- **Média diária de instalações**: Total de instalações / dias trabalhados
- **Taxa de conclusão por técnico**: (O.S. instaladas / O.S. atribuídas) * 100
- **Kits alocados vs. instalados**: Comparação entre kits alocados e efetivamente instalados

### 3. Análise por Região
- **Distribuição de O.S. por cidade**: Contagem de O.S. agrupadas por cidade
- **Taxa de conclusão por cidade**: (O.S. instaladas / total de O.S.) * 100 por cidade

## Requisitos para Exportação de Relatórios

### 1. Relatórios para Técnicos (PDF)
- **Lista de O.S. pendentes**: Detalhes de endereço, contato e referências
- **Roteiro de instalações**: Agrupadas por data e região
- **Formato**: PDF com cabeçalho, rodapé e formatação adequada para impressão

### 2. Relatórios Administrativos (CSV/PDF)
- **Desempenho por técnico**: Métricas de produtividade por período
- **Análise de conclusão**: Taxas de conclusão por região e técnico
- **Previsão de demanda**: Baseada em histórico de instalações
- **Formato**: CSV para análise em Excel e PDF para apresentação

## Requisitos para Cadastro e Gerenciamento

### 1. Cadastro de Ordens de Serviço
- Formulário completo com dados do cliente, endereço e técnico designado
- Seleção de cliente existente ou cadastro de novo cliente
- Definição de datas (criação, instalação prevista, vencimento)
- Alocação de kit e equipamentos

### 2. Cadastro de Técnicos
- Dados pessoais e múltiplos contatos
- Identificações utilizadas em campo e no aplicativo
- Status de atividade

### 3. Cadastro de Equipamentos
- Registro de fornecedor e tipo de kit
- Validação de serial
- Componentes inclusos no kit
- Rastreamento de alocação e instalação

## Alertas e Notificações

### 1. Alertas de Prazo
- O.S. com vencimento em até 3 dias (alta prioridade)
- O.S. com vencimento em até 7 dias (média prioridade)
- O.S. pendentes há mais de 15 dias (atenção especial)

### 2. Alertas de Desempenho
- Técnicos com taxa de conclusão abaixo da média
- Regiões com acúmulo de O.S. pendentes
- Kits alocados há mais de 7 dias sem instalação
