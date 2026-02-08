const API_BASE = 'http://localhost:5000/api';

class API {
    // PROCESSOS
    static async getProcessos() {
        const response = await fetch(`${API_BASE}/processos`);
        return response.json();
    }

    static async criarProcesso(nome, descricao) {
        const response = await fetch(`${API_BASE}/processos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, descricao })
        });
        return response.json();
    }

    static async getProcesso(id) {
        const response = await fetch(`${API_BASE}/processos/${id}`);
        return response.json();
    }

    static async getChecklist(processoId) {
        const response = await fetch(`${API_BASE}/processos/${processoId}/checklist`);
        return response.json();
    }

    static async adicionarItemChecklist(processoId, descricao) {
        const response = await fetch(`${API_BASE}/processos/${processoId}/checklist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao, ordem: 0 })
        });
        return response.json();
    }

    // VERIFICAÇÕES
    static async getVerificacoes(status = null) {
        const url = status ? `${API_BASE}/verificacoes?status=${status}` : `${API_BASE}/verificacoes`;
        const response = await fetch(url);
        return response.json();
    }

    static async criarVerificacao(processoId, responsavel) {
        const response = await fetch(`${API_BASE}/verificacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ processo_id: processoId, responsavel })
        });
        return response.json();
    }

    static async getVerificacao(id) {
        const response = await fetch(`${API_BASE}/verificacoes/${id}`);
        return response.json();
    }

    static async atualizarItemVerificacao(verificacaoId, itemId, concluido, observacao = '') {
        const response = await fetch(`${API_BASE}/verificacoes/${verificacaoId}/item/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ concluido, observacao })
        });
        return response.json();
    }

    static async concluirVerificacao(id, observacoes = '') {
        const response = await fetch(`${API_BASE}/verificacoes/${id}/concluir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ observacoes })
        });
        return response.json();
    }

    static async healthCheck() {
        const response = await fetch(`${API_BASE}/health`);
        return response.json();
    }

    static async initDb() {
        const response = await fetch(`${API_BASE}/init-db`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.json();
    }

    // TEMPLATES
    static async getTemplates() {
        const response = await fetch(`${API_BASE}/templates`);
        return response.json();
    }

    static async criarTemplate(nome, descricao, itens = []) {
        const response = await fetch(`${API_BASE}/templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, descricao, itens })
        });
        return response.json();
    }

    static async atualizarTemplateItens(templateId, itens = []) {
        const response = await fetch(`${API_BASE}/templates/${templateId}/itens`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itens })
        });
        return response.json();
    }

    static async aplicarTemplate(templateId, processoId) {
        const response = await fetch(`${API_BASE}/templates/${templateId}/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ processo_id: processoId })
        });
        return response.json();
    }
}

// Funções auxiliares
function mostrarMensagem(mensagem, tipo = 'success') {
    const classe = `bg-${tipo === 'success' ? 'green' : 'red'}-100 border border-${tipo === 'success' ? 'green' : 'red'}-400 text-${tipo === 'success' ? 'green' : 'red'}-700 px-4 py-3 rounded relative`;
    const html = `
        <div class="${classe}" role="alert">
            <button class="absolute top-0 bottom-0 right-0 px-4 py-3" onclick="this.parentElement.remove()">
                <span>&times;</span>
            </button>
            <p>${mensagem}</p>
        </div>
    `;
    
    const container = document.getElementById('mensagens');
    if (container) {
        container.innerHTML += html;
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }
}

function formatarData(data) {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function traduzirStatus(status) {
    const traducoes = {
        'pendente': 'Pendente',
        'em_andamento': 'Em Andamento',
        'concluido': 'Concluído',
        'ativo': 'Ativo',
        'inativo': 'Inativo'
    };
    return traducoes[status] || status;
}

function getCorStatus(status) {
    const cores = {
        'pendente': 'yellow',
        'em_andamento': 'blue',
        'concluido': 'green',
        'ativo': 'green',
        'inativo': 'gray'
    };
    const cor = cores[status] || 'gray';
    return `bg-${cor}-100 text-${cor}-800`;
}
