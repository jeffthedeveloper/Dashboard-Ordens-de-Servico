### **Roadmap Final de Produção: Dashboard de O.S.**

#### **1. Reestruturação do Repositório (Monorepo)**

A base de tudo é uma estrutura de pastas limpa. No seu repositório, organize tudo da seguinte forma:

```
/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── __init__.py
│   ├── migrations/
│   ├── static/      <-- (Opcional, se usar a Abordagem 2)
│   ├── templates/   <-- (Opcional, se usar a Abordagem 2)
│   ├── seed.py      <-- (NOVO: Para popular o DB)
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── ...
│   ├── src/
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
├── database/
│   └── dev.db       <-- (Banco de dados local SQLite)
│
├── .gitignore
└── render.yaml      <-- (NOVO: Instruções de deploy para o Render)
```

#### **2. Backend: Otimização para Recursos Mínimos**

O objetivo é manter o consumo de RAM e CPU baixo.

1.  **Banco de Dados (`database/`):**

      * Para o plano gratuito do Render, use **SQLite**. Ele é baseado em arquivo e não consome RAM de um serviço separado. Adicione `database/dev.db` ao `.gitignore`.

2.  **Popular o Banco (Seeding) (`backend/seed.py`):**

      * Crie um script que lê seus arquivos JSON de `/assets` (que agora estão "obsoletos") e os insere no banco de dados. Isso cria uma base de dados inicial para a demonstração.
      * **`backend/seed.py`:**
        ```python
        import json
        from app import create_app, db
        from app.models import Cliente, Tecnico, Cidade, OrdemServico # Importe seus modelos

        def seed_data():
            app = create_app()
            with app.app_context():
                # Exemplo para cidades
                with open('../frontend/src/assets/dados_cidades.json') as f: # Ajuste o caminho
                    data = json.load(f)
                    for cidade_data in data:
                        # Crie e adicione objetos ao DB
                        nova_cidade = Cidade(nome=cidade_data['cidade'], ...)
                        db.session.add(nova_cidade)
                # Repita para técnicos, clientes, ordens...
                db.session.commit()
                print("Banco de dados populado com sucesso!")
        ```
      * Adicione um comando ao Flask para executar isso. No `main.py`:
        ```python
        @app.cli.command("seed-db")
        def seed_db_command():
            from seed import seed_data
            seed_data()
        ```

#### **3. Backend: Implementação de Autenticação Simples**

Para proteger o acesso, criaremos um login básico sem bibliotecas complexas.

1.  **Crie a Rota de Login (`backend/app/routes/auth.py`):**

      * Crie uma nova rota `/api/login` que verifica um usuário e senha definidos nas variáveis de ambiente do Render.
      * **Exemplo:**
        ```python
        # Em uma nova rota
        import os
        from flask import request, jsonify

        @auth_bp.route('/login', methods=['POST'])
        def login():
            data = request.json
            user = data.get('username')
            pwd = data.get('password')

            if user == os.environ.get('ADMIN_USER') and pwd == os.environ.get('ADMIN_PASS'):
                # Token pode ser uma string estática simples para este caso de uso
                return jsonify({"token": os.environ.get('AUTH_TOKEN')}), 200
            return jsonify({"error": "Credenciais inválidas"}), 401
        ```

2.  **Proteja as Outras Rotas:**

      * Crie um "decorator" que verifica a presença do token no cabeçalho `Authorization` de cada requisição.
      * **Exemplo (em `auth.py`):**
        ```python
        from functools import wraps
        def token_required(f):
            @wraps(f)
            def decorated(*args, **kwargs):
                token = request.headers.get('Authorization')
                if token == f"Bearer {os.environ.get('AUTH_TOKEN')}":
                    return f(*args, **kwargs)
                return jsonify({"message": "Token inválido ou ausente"}), 401
            return decorated
        ```
      * Aplique este decorator a todas as suas rotas de dados: `@clientes_bp.route('/')`, `@token_required`, `def listar_clientes(): ...`

#### **4. Frontend: Otimização para Performance Mobile**

Para rodar liso em dispositivos antigos, o foco é reduzir o tempo de carregamento e o processamento.

1.  **Crie a Tela de Login:** Uma página simples que captura usuário/senha, chama a API `/login` e, em caso de sucesso, salva o token no `localStorage` e redireciona para o Dashboard.

2.  **Envie o Token:** Use `interceptors` do Axios para adicionar o token a todas as requisições futuras.

3.  **Code Splitting (Divisão de Código):**

      * Não carregue todas as páginas de uma vez. Use `React.lazy()` para carregar cada página (`Dashboard`, `Cidades`, etc.) somente quando o usuário navegar até ela.
      * **`frontend/src/App.tsx`:**
        ```tsx
        import React, { lazy, Suspense } from 'react';
        // ...
        const Dashboard = lazy(() => import('./pages/Dashboard'));
        const Cidades = lazy(() => import('./pages/Cidades'));
        // ...

        function App() {
          return (
            <Router>
              <Layout>
                <Suspense fallback={<div>Carregando...</div>}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/cidades" element={<Cidades />} />
                    {/* ... */}
                  </Routes>
                </Suspense>
              </Layout>
            </Router>
          );
        }
        ```

4.  **Virtualização de Listas:** Para a tabela de Ordens de Serviço, que pode ter muitos itens, use uma biblioteca como `react-virtualized` para renderizar apenas os itens visíveis na tela.

#### **5. Deploy Unificado com `render.yaml`**

Este arquivo na raiz do seu projeto diz ao Render como construir e servir sua aplicação monorepo.

  * **`render.yaml`:**
    ```yaml
    services:
      # Serviço para o Backend (API Flask)
      - type: web
        name: dashboard-os-api
        env: python
        rootDir: backend
        buildCommand: "pip install -r requirements.txt"
        startCommand: "gunicorn --workers=2 --threads=2 main:app"
        envVars:
          - key: PYTHON_VERSION
            value: 3.10.6
          - key: ADMIN_USER
            fromSecret: ADMIN_USER # Crie estes segredos no painel do Render
          - key: ADMIN_PASS
            fromSecret: ADMIN_PASS
          - key: AUTH_TOKEN
            fromSecret: AUTH_TOKEN

      # Serviço para o Frontend (React Static Site)
      - type: web
        name: dashboard-os-frontend
        env: static
        rootDir: frontend
        buildCommand: "npm install && npm run build"
        staticPublishPath: dist
        envVars:
          - key: VITE_API_URL
            value: https://dashboard-os-api.onrender.com # URL do serviço de backend
        routes:
          - type: rewrite
            source: /*
            destination: /index.html
