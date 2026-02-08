# 🚀 GUIA RÁPIDO - Sistema de Verificação de Processos

## ⚡ Instalação Rápida (5 minutos)

### Passo 1: Preparar o MySQL
```bash
# Abra o MySQL Console (cmd/PowerShell com admin)
mysql -u root

# Execute no console MySQL:
CREATE DATABASE sistema_cultura;
EXIT
```

### Passo 2: Configurar o Backend
```bash
cd backend

# Copiar configuração
copy .env.example .env

# Instalar dependências
pip install -r requirements.txt
```

### Passo 3: Iniciar o Backend
```bash
# Ainda em backend/
python app.py

# Aguarde até ver:
# * Running on http://127.0.0.1:5000
```

### Passo 4: Inicializar o Banco de Dados
```bash
# Em outro terminal (cmd/PowerShell)
cd backend

# Inicializar tabelas e popular com exemplo
python seed.py

# Ou manualmente, acesse no navegador:
# http://localhost:5000/api/init-db
```

### Passo 5: Abrir o Frontend
```bash
# Em um terceiro terminal
cd frontend

# Opção 1: Python (recomendado)
python -m http.server 8000

# Opção 2: Abra direto no navegador
file:///C:/Users/Jaci Neto/Desktop/sistema-cultura/frontend/index.html
```

**Acesse: http://localhost:8000** (ou o caminho do arquivo HTML)

---

## 📖 Fluxo de Uso

### 1️⃣ Criar um Processo
- Vá em **Processos**
- Clique em **+ Novo Processo**
- Digite nome e descrição
- ✓ Pronto!

### 2️⃣ Adicionar Itens ao Check-list
- No card do processo, clique em **Gerenciar Check-list**
- Digite a descrição do item
- Clique em **Adicionar Item**
- ✓ Repetir para cada item

### 3️⃣ Iniciar uma Verificação
- No card do processo, clique em **Nova Verificação**
- Digite o nome de quem vai fazer a verificação
- ✓ Abre automaticamente a tela de verificação

### 4️⃣ Preencher o Check-list
- Marque os itens conforme forem sendo verificados
- Adicione observações se necessário
- Clique em **Finalizar Verificação**
- ✓ Verificação concluída!

### 5️⃣ Acompanhar no Dashboard
- Vá em **Dashboard**
- Veja estatísticas de processos e verificações
- ✓ Sempre atualizado!

---

## 🆘 Solução de Problemas

### ❌ "Erro ao conectar com o servidor"
**Solução:** Backend não está rodando
```bash
# No terminal do backend, execute:
python app.py
```

### ❌ "Base de dados não existe"
**Solução:** Não foi inicializada
```bash
# No terminal do backend (Ctrl+C para parar, depois):
python seed.py
```

### ❌ "CORS Error" no console
**Solução:** Verifique se API está em http://localhost:5000

### ❌ "MySQL Error 1045"
**Solução:** Credenciais incorretas em `.env`
```
Edite backend/.env:
MYSQL_USER=seu_usuario
MYSQL_PASSWORD=sua_senha
```

---

## 📁 Estrutura do Projeto

```
sistema-cultura/
├── backend/                 # API Flask (Python)
│   ├── app.py              # Aplicação principal
│   ├── models.py           # Banco de dados
│   ├── config.py           # Configurações
│   ├── routes/             # Endpoints da API
│   ├── requirements.txt     # Dependências Python
│   ├── .env.example        # Exemplo de configuração
│   └── seed.py             # Popular banco de dados
│
├── frontend/               # Interface do usuário
│   ├── index.html          # Página principal
│   ├── css/style.css       # Estilos customizados
│   └── js/
│       ├── api.js          # Cliente HTTP API
│       └── main.js         # Lógica da aplicação
│
└── README.md               # Documentação completa
```

---

## 💡 Dicas

- **Marque como obrigatório**: O asterisco (*) indica itens obrigatórios
- **Rastreamento**: Cada verificação é registrada com data e responsável
- **Progresso**: Visualize o progresso em tempo real com a barra de progresso
- **Observações**: Sempre adicione observações importantes para auditoria

---

## 🔧 Requisitos Técnicos

| Item | Versão |
|------|--------|
| Python | 3.8+ |
| MySQL | 8.0+ |
| Navegador | Chrome/Firefox/Edge (moderno) |
| RAM | 512MB+ |
| Espaço em disco | 50MB+ |

---

## 📞 Verificar Saúde do Sistema

Abra no navegador:
```
http://localhost:5000/api/health
```

Se ver `{"status": "ok"}` → ✅ Sistema funcionando!

---

**Pronto! Seu sistema está funcionando. Boa sorte! 🎉**
