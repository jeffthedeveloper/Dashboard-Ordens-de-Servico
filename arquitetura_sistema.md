# Arquitetura e Estrutura do Sistema - Dashboard de Ordens de Serviço V2.0

## Visão Geral da Arquitetura

Para atender aos requisitos da versão 2.0 do sistema, adotaremos uma arquitetura cliente-servidor com separação clara entre frontend e backend:

### Arquitetura de Alto Nível

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │◄───►│     Backend     │◄───►│  Banco de Dados │
│    (React)      │     │    (Flask)      │     │    (SQLite)     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 1. Componentes do Backend (Flask)

### Estrutura de Diretórios
```
backend/
├── app/
│   ├── __init__.py          # Inicialização da aplicação Flask
│   ├── config.py            # Configurações do aplicativo
│   ├── models/              # Modelos de dados (SQLAlchemy)
│   │   ├── __init__.py
│   │   ├── ordem_servico.py
│   │   ├── cliente.py
│   │   ├── tecnico.py
│   │   ├── cidade.py
│   │   ├── contato.py
│   │   ├── fornecedor.py
│   │   ├── kit.py
│   │   └── componente.py
│   ├── routes/              # Rotas da API
│   │   ├── __init__.py
│   │   ├── ordens.py
│   │   ├── clientes.py
│   │   ├── tecnicos.py
│   │   ├── cidades.py
│   │   ├── fornecedores.py
│   │   ├── kits.py
│   │   └── relatorios.py
│   ├── services/            # Lógica de negócios
│   │   ├── __init__.py
│   │   ├── ordem_service.py
│   │   ├── relatorio_service.py
│   │   └── alerta_service.py
│   └── utils/               # Utilitários
│       ├── __init__.py
│       ├── pdf_generator.py
│       ├── csv_generator.py
│       └── validators.py
├── migrations/              # Migrações do banco de dados
├── tests/                   # Testes unitários e de integração
├── venv/                    # Ambiente virtual Python
├── requirements.txt         # Dependências do projeto
└── main.py                  # Ponto de entrada da aplicação
```

### APIs RESTful

#### 1. API de Ordens de Serviço
- `GET /api/ordens` - Listar todas as ordens (com filtros)
- `GET /api/ordens/<id>` - Obter detalhes de uma ordem
- `POST /api/ordens` - Criar nova ordem
- `PUT /api/ordens/<id>` - Atualizar ordem existente
- `DELETE /api/ordens/<id>` - Excluir ordem

#### 2. API de Clientes
- `GET /api/clientes` - Listar todos os clientes
- `GET /api/clientes/<id>` - Obter detalhes de um cliente
- `POST /api/clientes` - Criar novo cliente
- `PUT /api/clientes/<id>` - Atualizar cliente existente
- `DELETE /api/clientes/<id>` - Excluir cliente

#### 3. API de Técnicos
- `GET /api/tecnicos` - Listar todos os técnicos
- `GET /api/tecnicos/<id>` - Obter detalhes de um técnico
- `POST /api/tecnicos` - Criar novo técnico
- `PUT /api/tecnicos/<id>` - Atualizar técnico existente
- `DELETE /api/tecnicos/<id>` - Excluir técnico

#### 4. API de Relatórios
- `GET /api/relatorios/tecnicos` - Gerar relatório para técnicos (PDF)
- `GET /api/relatorios/admin` - Gerar relatório administrativo (CSV/PDF)
- `GET /api/relatorios/desempenho` - Relatório de desempenho por técnico
- `GET /api/relatorios/vencimento` - Relatório de O.S. por vencimento

#### 5. API de Métricas
- `GET /api/metricas/dashboard` - Métricas para o dashboard principal
- `GET /api/metricas/tecnicos` - Métricas de desempenho por técnico
- `GET /api/metricas/cidades` - Métricas por cidade
- `GET /api/metricas/alertas` - Alertas de prazos e desempenho

### Dependências do Backend
- Flask: Framework web
- SQLAlchemy: ORM para banco de dados
- Flask-Migrate: Migrações de banco de dados
- Flask-CORS: Suporte a CORS
- WeasyPrint: Geração de PDFs
- pandas: Processamento de dados e exportação CSV
- marshmallow: Serialização/deserialização de dados

## 2. Componentes do Frontend (React)

### Estrutura de Diretórios
```
frontend/
├── public/
│   ├── index.html
│   └── assets/
├── src/
│   ├── assets/              # Recursos estáticos
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/              # Componentes de UI básicos
│   │   ├── layout/          # Componentes de layout
│   │   ├── forms/           # Componentes de formulário
│   │   ├── tables/          # Componentes de tabela
│   │   ├── charts/          # Componentes de gráficos
│   │   └── maps/            # Componentes de mapas
│   ├── pages/               # Páginas da aplicação
│   │   ├── Dashboard.tsx
│   │   ├── OrdemServico/
│   │   │   ├── Lista.tsx
│   │   │   ├── Detalhes.tsx
│   │   │   ├── Cadastro.tsx
│   │   │   └── Edicao.tsx
│   │   ├── Clientes/
│   │   ├── Tecnicos/
│   │   ├── Relatorios/
│   │   └── Configuracoes/
│   ├── services/            # Serviços de API
│   │   ├── api.ts
│   │   ├── ordemService.ts
│   │   ├── clienteService.ts
│   │   └── ...
│   ├── hooks/               # Hooks personalizados
│   ├── contexts/            # Contextos React
│   ├── utils/               # Utilitários
│   ├── types/               # Definições de tipos TypeScript
│   ├── App.tsx              # Componente principal
│   └── main.tsx             # Ponto de entrada
├── package.json
└── tsconfig.json
```

### Páginas e Funcionalidades

#### 1. Dashboard Principal
- Cards com métricas principais
- Gráficos de desempenho
- Lista de O.S. próximas do vencimento
- Filtros por período, técnico e cidade

#### 2. Gestão de Ordens de Serviço
- Listagem com filtros avançados
- Formulário de cadastro/edição
- Visualização detalhada
- Alocação de técnicos e equipamentos
- Exportação de relatórios

#### 3. Gestão de Técnicos
- Cadastro e edição de técnicos
- Visualização de desempenho
- Histórico de instalações
- Kits alocados

#### 4. Gestão de Clientes
- Cadastro e edição de clientes
- Histórico de ordens de serviço
- Múltiplos contatos

#### 5. Relatórios
- Geração de relatórios para técnicos (PDF)
- Relatórios administrativos (CSV/PDF)
- Personalização de parâmetros
- Visualização prévia

#### 6. Visualização Geográfica
- Mapa de instalações por região
- Validação de endereços
- Rotas otimizadas para técnicos

### Dependências do Frontend
- React: Biblioteca UI
- TypeScript: Tipagem estática
- React Router: Roteamento
- Recharts: Gráficos
- TanStack Table: Tabelas interativas
- React Hook Form: Formulários
- Tailwind CSS: Estilização
- Axios: Requisições HTTP
- React Query: Gerenciamento de estado e cache

## 3. Banco de Dados

### Tecnologia
- SQLite (desenvolvimento)
- MySQL (produção, se necessário)

### Diagrama ER Simplificado
```
+---------------+     +---------------+     +---------------+
|               |     |               |     |               |
| OrdemServico  +-----+ Cliente       +-----+ Cidade        |
|               |     |               |     |               |
+-------+-------+     +-------+-------+     +---------------+
        |                     |
        |                     |
+-------v-------+     +-------v-------+
|               |     |               |
| Tecnico       |     | Contato       |
|               |     |               |
+-------+-------+     +---------------+
        |
        |
+-------v-------+     +---------------+
|               |     |               |
| Kit           +-----+ Componente    |
|               |     |               |
+-------+-------+     +---------------+
        |
        |
+-------v-------+
|               |
| Fornecedor    |
|               |
+---------------+
```

## 4. Fluxos de Usuário Principais

### Fluxo de Cadastro de Ordem de Serviço
1. Usuário acessa a página de cadastro de O.S.
2. Seleciona cliente existente ou cadastra novo
3. Preenche dados da instalação (endereço, referências)
4. Seleciona técnico responsável
5. Define datas (criação, instalação prevista, vencimento)
6. Aloca kit/equipamentos (opcional)
7. Salva a ordem de serviço
8. Sistema registra e exibe confirmação

### Fluxo de Exportação de Relatório
1. Usuário acessa a página de relatórios
2. Seleciona tipo de relatório (técnico ou administrativo)
3. Define parâmetros (período, técnico, cidade)
4. Visualiza prévia do relatório
5. Seleciona formato de exportação (PDF/CSV)
6. Sistema gera e disponibiliza o arquivo para download

### Fluxo de Acompanhamento de Prazos
1. Dashboard exibe alertas de O.S. próximas do vencimento
2. Usuário acessa lista filtrada por prioridade
3. Visualiza detalhes e status de cada O.S.
4. Atualiza informações ou redefine prioridades
5. Sistema atualiza métricas e alertas

## 5. Requisitos Técnicos

### Requisitos de Servidor
- Python 3.8+
- Flask 2.0+
- SQLAlchemy 1.4+
- 512MB RAM mínimo
- 1GB espaço em disco

### Requisitos de Cliente
- Navegadores modernos (Chrome, Firefox, Edge, Safari)
- JavaScript habilitado
- Resolução mínima: 1280x720

### Considerações de Segurança
- Autenticação de usuários (a ser implementada)
- Validação de entrada em todos os formulários
- Sanitização de dados para prevenção de SQL Injection
- CORS configurado para permitir apenas origens confiáveis

## 6. Plano de Implementação

### Fase 1: Configuração e Estrutura Básica
- Configurar ambiente de desenvolvimento
- Implementar modelos de dados e migrações
- Criar estrutura básica de APIs
- Configurar projeto React

### Fase 2: Funcionalidades Prioritárias
- Implementar cadastro de ordens de serviço
- Desenvolver exportação de relatórios
- Criar dashboard com métricas principais
- Implementar sistema de alertas de prazos

### Fase 3: Funcionalidades Complementares
- Implementar gestão de técnicos e clientes
- Desenvolver visualização geográfica
- Criar gestão de equipamentos
- Implementar relatórios avançados

### Fase 4: Testes e Implantação
- Realizar testes de integração
- Validar responsividade e usabilidade
- Implantar backend e frontend
- Documentar sistema
