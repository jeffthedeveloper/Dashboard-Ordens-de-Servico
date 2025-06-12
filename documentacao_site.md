# Documentação do Site de Dashboard de Ordens de Serviço

## Visão Geral

Este site foi desenvolvido para visualização e análise de dados de ordens de serviço, oferecendo uma interface responsiva e interativa que se adapta a diferentes dispositivos e tamanhos de tela. O sistema permite acompanhar métricas de desempenho, filtrar dados, gerar relatórios e exportar informações.

## Funcionalidades Implementadas

### 1. Dashboard Principal
- Cards com métricas principais (total de O.S., cidades atendidas, técnicos ativos, média diária)
- Gráficos interativos de instalações por cidade
- Gráficos de distribuição por cidade (pizza)
- Gráficos de instalações por técnico
- Gráfico de evolução temporal de instalações

### 2. Ordens de Serviço
- Tabela completa com paginação
- Filtros por texto (busca), cidade e técnico
- Visualização detalhada dos dados

### 3. Técnicos
- Visualização de desempenho individual
- Comparativo entre técnicos
- Métricas de produtividade

### 4. Cidades
- Análise por localidade
- Estatísticas detalhadas por cidade
- Comparativo entre cidades

### 5. Relatórios
- Geração de relatórios personalizados
- Seleção de parâmetros (tipo, período, cidade, técnico)
- Exportação em diferentes formatos (CSV, PDF)

### 6. Recursos Técnicos
- Tema claro/escuro
- Responsividade completa (desktop, tablet, mobile)
- Acessibilidade aprimorada
- Exportação de dados

## Tecnologias Utilizadas

- **Frontend**: React com TypeScript
- **Estilização**: Tailwind CSS
- **Gráficos**: Recharts
- **Exportação**: Utilitários personalizados para CSV e PDF

## Estrutura do Projeto

```
projeto_site/
├── src/
│   ├── assets/              # Dados JSON para o frontend
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/              # Componentes de UI básicos
│   │   └── ...
│   ├── pages/               # Páginas principais
│   │   ├── Dashboard.tsx
│   │   ├── OrdensServico.tsx
│   │   ├── Tecnicos.tsx
│   │   ├── Cidades.tsx
│   │   └── Relatorios.tsx
│   ├── utils/               # Utilitários
│   │   ├── exportUtils.ts   # Funções de exportação
│   │   ├── accessibilityUtils.ts # Funções de acessibilidade
│   │   └── anonymizeUtils.ts # Funções de anonimização
│   ├── App.tsx              # Componente principal
│   ├── App.css              # Estilos globais
│   └── Layout.tsx           # Layout comum
└── ...
```

## Anonimização de Dados

Todos os dados apresentados no site foram anonimizados para proteger informações sensíveis:

- Nomes de técnicos substituídos por "Técnico A", "Técnico B", etc.
- Nomes de cidades substituídos por "Cidade A", "Cidade B", etc.
- Nomes de empresas substituídos por "Empresa Alpha", "Empresa Beta", etc.
- Nomes de clientes substituídos por "Cliente 001", "Cliente 002", etc.
- Endereços e telefones substituídos por versões genéricas
- Valores numéricos recalculados para manter apenas as proporções

## Guia de Uso

### Navegação
- Use o menu lateral (desktop) ou o menu hambúrguer (mobile) para navegar entre as páginas
- Alterne entre tema claro e escuro usando o botão no cabeçalho

### Dashboard
- Visualize métricas gerais nos cards superiores
- Explore os gráficos interativos passando o mouse sobre os elementos (ou tocando em dispositivos móveis)

### Ordens de Serviço
- Use os filtros superiores para refinar a visualização
- Navegue entre páginas usando os controles de paginação
- Clique nas linhas para ver mais detalhes (quando implementado)

### Relatórios
- Selecione o tipo de relatório desejado
- Aplique filtros conforme necessário
- Clique em "Gerar Relatório" para visualizar os dados
- Use os botões de exportação para baixar em CSV ou PDF

## Responsividade

O site foi projetado para funcionar em diversos dispositivos:

- **Desktop**: Layout completo com sidebar e visualização expandida
- **Tablet**: Layout adaptado com sidebar colapsável
- **Mobile**: Menu hambúrguer e layout empilhado para melhor visualização

## Acessibilidade

Foram implementados diversos recursos de acessibilidade:

- Contraste adequado entre texto e fundo
- Navegação por teclado
- Suporte a leitores de tela
- Textos alternativos para elementos visuais

## Implantação

Para implantar o site em um ambiente de produção:

1. Certifique-se de que todos os arquivos estão presentes na estrutura correta
2. Execute `npm install` para instalar as dependências
3. Execute `npm run build` para gerar a versão de produção
4. Implante os arquivos gerados na pasta `build` em um servidor web

## Considerações Finais

Este site foi desenvolvido como uma ferramenta de visualização e análise de dados, com foco em usabilidade, responsividade e interatividade. A anonimização dos dados garante a proteção de informações sensíveis, permitindo uma apresentação segura e em conformidade com a LGPD.
