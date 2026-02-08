# Sistema de Verificação de Processos

Um sistema simples e intuitivo para gerenciar verificações de processos com check-lists personalizados. Construído com Python (Flask), JavaScript, Tailwind CSS e MySQL.

## 🎯 Funcionalidades

- ✅ **Gerenciar Processos**: Crie e organize diferentes tipos de processos
- ✅ **Check-lists Personalizados**: Defina itens de verificação específicos para cada processo
- ✅ **Rastreamento de Verificações**: Acompanhe o status e progresso de cada verificação
- ✅ **Dashboard**: Visualize estatísticas e resumos em tempo real
- ✅ **Interface Responsiva**: Funciona em desktop e mobile com Tailwind CSS

## 🛠️ Stack Tecnológico

- **Backend**: Python 3.8+ com Flask
- **Frontend**: HTML5, JavaScript (Vanilla), Tailwind CSS
- **Banco de Dados**: MySQL 8.0+
- **API**: REST com CORS habilitado

## 📋 Pré-requisitos

- Python 3.8 ou superior
- MySQL Server instalado e rodando
- pip (gerenciador de pacotes Python)
- Um navegador moderno

## 🚀 Instalação e Execução

### 1. Clonar o repositório

\`\`\`bash
cd sistema-cultura
\`\`\`

### 2. Configurar o Banco de Dados

Crie o banco de dados MySQL:

\`\`\`sql
CREATE DATABASE sistema_cultura;
\`\`\`

### 3. Configurar o Backend (Python)

\`\`\`bash
cd backend

# Criar arquivo .env (copiar de .env.example)
copy .env.example .env

# Instalar dependências
pip install -r requirements.txt

# Iniciar o servidor Flask
python app.py
\`\`\`

O backend estará rodando em: **http://localhost:5000**

### 4. Inicializar o Banco de Dados

Acesse no navegador:

\`\`\`
http://localhost:5000/api/init-db
\`\`\`

Abra o DevTools (F12) para conferir se recebeu um status 201.

### 5. Abrir o Frontend

Navegue até:

\`\`\`
file:///.../sistema-cultura/frontend/index.html
\`\`\`

Ou use um servidor local (recomendado):

\`\`\`bash
# Com Python 3
cd frontend
python -m http.server 8000

# Depois acesse: http://localhost:8000
\`\`\`

## 📖 Como Usar

### Dashboard
- Visualize o resumo geral do sistema
- Acompanhe quantidade de processos e verificações

### Processos
- Clique em **+ Novo Processo** para criar um novo tipo
- Gerenciar Check-list: customize os itens de verificação para cada processo
- Nova Verificação: inicie uma verificação para um processo

### Verificações
- Lista todas as verificações realizadas
- Acompanhe o status: Pendente, Em Andamento ou Concluído
- Clique em "Detalhes" para abrir e preencher o check-list
- Adicione observações para cada item
- Finalize a verificação quando todos os itens forem concluídos

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### processos
- `id`: ID único do processo
- `nome`: Nome do processo
- `descricao`: Descrição detalhada
- `status`: ativo/inativo

#### checklist_itens
- `id`: ID único do item
- `processo_id`: Referência ao processo
- `descricao`: Descrição do item
- `obrigatorio`: Se é obrigatório
- `ordem`: Ordem de exibição

#### verificacoes
- `id`: ID única da verificação
- `processo_id`: Referência ao processo
- `responsavel`: Quem realizou a verificação
- `status`: pendente/em_andamento/concluido
- `data_inicio`: Quando começou
- `data_conclusao`: Quando terminou

#### verificacao_itens
- `id`: ID único
- `verificacao_id`: Referência à verificação
- `checklist_item_id`: Referência ao item do check-list
- `concluido`: Se foi concluído
- `observacao`: Anotações sobre o item

## 🔌 API Endpoints

### Processos
- `GET /api/processos` - Listar todos os processos
- `POST /api/processos` - Criar novo processo
- `GET /api/processos/<id>` - Obter detalhes do processo
- `GET /api/processos/<id>/checklist` - Listar itens do check-list
- `POST /api/processos/<id>/checklist` - Adicionar item ao check-list

### Verificações
- `GET /api/verificacoes` - Listar verificações
- `POST /api/verificacoes` - Criar nova verificação
- `GET /api/verificacoes/<id>` - Obter detalhes da verificação
- `PUT /api/verificacoes/<id>/item/<item_id>` - Atualizar item
- `POST /api/verificacoes/<id>/concluir` - Finalizar verificação

### Utilitários
- `GET /api/health` - Verificar status do servidor
- `POST /api/init-db` - Inicializar banco de dados

## 🎨 Customização

### Mudar cores do Tailwind
Edite o arquivo `frontend/index.html` na tag \`<script>\` do Tailwind.

### Adicionar novos campos
Modifique os arquivos em:
- Backend: \`models.py\` (tabelas) e \`routes/\` (endpoints)
- Frontend: \`js/api.js\` (chamadas) e \`js/main.js\` (interface)

### Adicionar novos processos
Acesse a seção "Processos" > "+ Novo Processo" na interface.

## 🐛 Troubleshooting

### Erro: "Nao conseguiu conectar ao servidor MySQL"
- Verifique se o MySQL está rodando
- Confira as credenciais em \`.env\`

### Erro: "Base de dados 'sistema_cultura' nao existe"
- Acesse \`POST /api/init-db\` para criar as tabelas

### CORS Error no Frontend
- O backend está habilitado com CORS
- Confira se está rodando em http://localhost:5000

### Frontend não carrega dados
- Abra o DevTools (F12) e confira a aba "Network"
- Verifique se o backend está rodando

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Os logs do terminal do Flask
2. O console do navegador (F12)
3. As configurações em \`.env\`

## 📄 Licença

Este projeto é fornecido como está para uso pessoal e educacional.

---

**Desenvolvido com ❤️ para otimizar sua gestão de processos!**
