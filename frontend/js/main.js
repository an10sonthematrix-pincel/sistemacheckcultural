// ConfiguraÃ§Ã£o do sistema
const SISTEMA = {
    titulo: 'Sistema de VerificaÃ§Ã£o de Processos',
    versao: '1.0.0'
};

// VariÃ¡veis globais para modal de tipo de pessoa
let contextoTipoPessoa = {
    tipo: null,
    nome: null,
    sei: null,
    callback: null
};

// ===== VALIDAÃ‡ÃƒO E FORMATAÃ‡ÃƒO DE DOCUMENTOS =====

// FunÃ§Ã£o para validar CPF
function validarCPF(cpf) {
    // Remove caracteres nÃ£o numÃ©ricos
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dÃ­gitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dÃ­gitos sÃ£o iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Calcula primeiro dÃ­gito verificador
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    // Calcula segundo dÃ­gito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

// FunÃ§Ã£o para validar CNPJ
function validarCNPJ(cnpj) {
    // Remove caracteres nÃ£o numÃ©ricos
    cnpj = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dÃ­gitos
    if (cnpj.length !== 14) return false;
    
    // Verifica se todos os dÃ­gitos sÃ£o iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Calcula primeiro dÃ­gito verificador
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    // Calcula segundo dÃ­gito verificador
    tamanho = cnpj.length - 1;
    numeros = cnpj.substring(0, tamanho);
    suma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
}

// FunÃ§Ã£o para formatar CPF
function formatarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return cpf;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// FunÃ§Ã£o para formatar CNPJ
function formatarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) return cnpj;
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// InicializaÃ§Ã£o
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const health = await API.healthCheck();
        console.log('Backend conectado:', health);
    } catch (erro) {
        console.error('Erro ao conectar com o backend:', erro);
        mostrarMensagem('Erro ao conectar com o servidor. Verifique se a API estÃ¡ rodando em http://localhost:5000', 'error');
    }
    
    // Ativar seÃ§Ã£o padrÃ£o
    ativarSecao('dashboard');
    
    // Adicionar listeners para formataÃ§Ã£o em tempo real
    const inputCPF = document.getElementById('input-cpf');
    const inputCNPJ = document.getElementById('input-cnpj');
    
    if (inputCPF) {
        inputCPF.addEventListener('input', () => formatarCPFEmTempo(inputCPF));
    }
    
    if (inputCNPJ) {
        inputCNPJ.addEventListener('input', () => formatarCNPJEmTempo(inputCNPJ));
    }
});

// Gerenciamento de seÃ§Ãµes
function ativarSecao(secao) {
    // Ocultar todas as seÃ§Ãµes
    document.querySelectorAll('[data-secao]').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Mostrar seÃ§Ã£o ativa
    const secaoEl = document.querySelector(`[data-secao="${secao}"]`);
    if (secaoEl) {
        secaoEl.classList.remove('hidden');
    }
    
    // Atualizar menu ativo
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('bg-blue-600', 'text-white');
        el.classList.add('text-gray-600', 'hover:text-blue-600');
    });
    
    document.querySelector(`[onclick*="'${secao}'"]`)?.classList.add('bg-blue-600', 'text-white');
    
    // Carregar dados da seÃ§Ã£o
    if (secao === 'processos') {
        carregarProcessos();
    } else if (secao === 'verificacoes') {
        carregarVerificacoes();
    }
}

// ===== PROCESSOS =====
async function carregarProcessos() {
    try {
        const processos = await API.getProcessos();
        const container = document.getElementById('lista-processos');
        
        if (processos.length === 0) {
            container.innerHTML = '<p class="text-gray-500">Nenhum processo cadastrado. Crie um novo processo!</p>';
            return;
        }
        
        container.innerHTML = processos.map(p => `
            <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">${p.nome}</h3>
                        <p class="text-gray-600 text-sm mt-1">${p.descricao || ''}</p>
                    </div>
                    <span class="inline-block px-3 py-1 text-sm font-semibold rounded-full ${getCorStatus(p.status)}">
                        ${traduzirStatus(p.status)}
                    </span>
                </div>
                <div class="flex gap-2">
                    <button onclick="abrirModalChecklistProcesso(${p.id})" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                        Gerenciar Check-list
                    </button>
                    <button onclick="startarVerificacao(${p.id}, '${p.nome}')" class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                        Nova VerificaÃ§Ã£o
                    </button>
                </div>
            </div>
        `).join('');
    } catch (erro) {
        console.error('Erro ao carregar processos:', erro);
        mostrarMensagem('Erro ao carregar processos', 'error');
    }
}

async function criarProcesso() {
    const nome = prompt('Nome do processo:');
    if (!nome) return;
    
    const descricao = prompt('DescriÃ§Ã£o (opcional):');
    
    try {
        const resultado = await API.criarProcesso(nome, descricao);
        mostrarMensagem('Processo criado com sucesso!');
        carregarProcessos();
    } catch (erro) {
        console.error('Erro ao criar processo:', erro);
        mostrarMensagem('Erro ao criar processo', 'error');
    }
}

// Modal para escolher tipo de novo processo
async function abrirModalNovoProcesso() {
    document.getElementById('modal-novo-processo').classList.remove('hidden');
}

async function criarProcessoArtista() {
    fecharModal('modal-novo-processo');
    
    const sei = prompt('Nº SEI (Artista):');
    if (!sei) return;
    
    const nome = prompt('Nome do Artista:');
    if (!nome) return;
    
    // Abre modal para selecionar PF/PJ
    contextoTipoPessoa = {
        tipo: 'artista',
        nome: nome,
        sei: sei,
        callback: processarTipoPessoaArtista
    };
    
    // Limpar seleÃ§Ã£o anterior
    document.querySelectorAll('input[name="tipo-pessoa"]').forEach(r => r.checked = false);
    
    document.getElementById('modal-tipo-pessoa').classList.remove('hidden');
}

async function criarProcessoParecerista() {
    fecharModal('modal-novo-processo');
    
    const sei = prompt('Nº SEI (Parecerista):');
    if (!sei) return;
    
    const nome = prompt('Nome do Parecerista:');
    if (!nome) return;
    
    // Abre modal para selecionar PF/PJ
    contextoTipoPessoa = {
        tipo: 'parecerista',
        nome: nome,
        sei: sei,
        callback: processarTipoPessoaParecerista
    };
    
    // Limpar seleÃ§Ã£o anterior
    document.querySelectorAll('input[name="tipo-pessoa"]').forEach(r => r.checked = false);
    
    document.getElementById('modal-tipo-pessoa').classList.remove('hidden');
}

// FunÃ§Ã£o para confirmar tipo de pessoa (PF/PJ)
// FunÃ§Ã£o para auto-formatar CPF em tempo real
async function criarProcessoPalestrante() {
    fecharModal('modal-novo-processo');

    const sei = prompt('Nº SEI (Palestrante):');
    if (!sei) return;

    const nome = prompt('Nome do Palestrante:');
    if (!nome) return;

    // Abre modal para selecionar PF/PJ
    contextoTipoPessoa = {
        tipo: 'palestrante',
        nome: nome,
        sei: sei,
        callback: processarTipoPessoaPalestrante
    };

    // Limpar seleÃ§Ã£o anterior
    document.querySelectorAll('input[name="tipo-pessoa"]').forEach(r => r.checked = false);

    document.getElementById('modal-tipo-pessoa').classList.remove('hidden');
}

function formatarCPFEmTempo(input) {
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length <= 3) {
        input.value = valor;
    } else if (valor.length <= 6) {
        input.value = valor.substring(0, 3) + '.' + valor.substring(3);
    } else if (valor.length <= 9) {
        input.value = valor.substring(0, 3) + '.' + valor.substring(3, 6) + '.' + valor.substring(6);
    } else {
        input.value = valor.substring(0, 3) + '.' + valor.substring(3, 6) + '.' + valor.substring(6, 9) + '-' + valor.substring(9, 11);
    }
}

// FunÃ§Ã£o para auto-formatar CNPJ em tempo real
function formatarCNPJEmTempo(input) {
    let valor = input.value.replace(/\D/g, '');
    
    if (valor.length <= 2) {
        input.value = valor;
    } else if (valor.length <= 5) {
        input.value = valor.substring(0, 2) + '.' + valor.substring(2);
    } else if (valor.length <= 8) {
        input.value = valor.substring(0, 2) + '.' + valor.substring(2, 5) + '.' + valor.substring(5);
    } else if (valor.length <= 12) {
        input.value = valor.substring(0, 2) + '.' + valor.substring(2, 5) + '.' + valor.substring(5, 8) + '/' + valor.substring(8);
    } else {
        input.value = valor.substring(0, 2) + '.' + valor.substring(2, 5) + '.' + valor.substring(5, 8) + '/' + valor.substring(8, 12) + '-' + valor.substring(12, 14);
    }
}

// FunÃ§Ã£o para selecionar tipo de pessoa e mostrar campo apropriado
function selecionarTipoPessoa(tipo) {
    document.getElementById('campo-cpf').classList.add('hidden');
    document.getElementById('campo-cnpj').classList.add('hidden');
    
    if (tipo === 'pf') {
        document.getElementById('campo-cpf').classList.remove('hidden');
        setTimeout(() => document.getElementById('input-cpf').focus(), 100);
    } else if (tipo === 'pj') {
        document.getElementById('campo-cnpj').classList.remove('hidden');
        setTimeout(() => document.getElementById('input-cnpj').focus(), 100);
    }
}

function confirmarTipoPessoa() {
    const tipoPessoa = document.querySelector('input[name="tipo-pessoa"]:checked')?.value;
    
    if (!tipoPessoa) {
        mostrarMensagem('Selecione um tipo de pessoa', 'error');
        return;
    }
    
    let documento = '';
    
    if (tipoPessoa === 'pf') {
        documento = document.getElementById('input-cpf').value.replace(/\D/g, '');
        
        if (!documento) {
            mostrarMensagem('Informe o CPF', 'error');
            document.getElementById('input-cpf').focus();
            return;
        }
        
        if (!validarCPF(documento)) {
            mostrarMensagem('CPF invÃ¡lido! Verifique os nÃºmeros informados.', 'error');
            document.getElementById('input-cpf').focus();
            return;
        }
    } else if (tipoPessoa === 'pj') {
        documento = document.getElementById('input-cnpj').value.replace(/\D/g, '');
        
        if (!documento) {
            mostrarMensagem('Informe o CNPJ', 'error');
            document.getElementById('input-cnpj').focus();
            return;
        }
        
        if (!validarCNPJ(documento)) {
            mostrarMensagem('CNPJ invÃ¡lido! Verifique os nÃºmeros informados.', 'error');
            document.getElementById('input-cnpj').focus();
            return;
        }
    }
    
    fecharModal('modal-tipo-pessoa');
    
    // Armazena o documento validado e limpo
    contextoTipoPessoa.documento = documento;
    
    // Chama o callback apropriado
    if (contextoTipoPessoa.callback) {
        contextoTipoPessoa.callback(tipoPessoa);
    }
}

// Processador para Artista
async function processarTipoPessoaArtista(tipoPessoa) {
    const isPF = tipoPessoa === 'pf';
    const labelDocumento = isPF ? 'CPF' : 'CNPJ';
    const documento = isPF ? formatarCPF(contextoTipoPessoa.documento) : formatarCNPJ(contextoTipoPessoa.documento);
    
    try {
        const resultado = await API.criarProcesso(
            contextoTipoPessoa.sei, 
            `${contextoTipoPessoa.nome}\n${labelDocumento}: ${documento}\nSEI: ${contextoTipoPessoa.sei}`
        );
        
        if (resultado && resultado.id) {
            mostrarMensagem('Processo criado! Aplicando check-list do artista...');
            const aplicado = await aplicarTemplateArtistaTipo(tipoPessoa, resultado.id, {
                fecharModal: false,
                abrirChecklist: false
            });
            carregarProcessos();
            if (aplicado) {
                await startarVerificacao(resultado.id, contextoTipoPessoa.nome);
            }
        }
    } catch (erro) {
        console.error('Erro ao criar processo Artista:', erro);
        mostrarMensagem('Erro ao criar processo', 'error');
    }
}

// Processador para Parecerista
async function processarTipoPessoaParecerista(tipoPessoa) {
    const isPF = tipoPessoa === 'pf';
    const labelDocumento = isPF ? 'CPF' : 'CNPJ';
    const documento = isPF ? formatarCPF(contextoTipoPessoa.documento) : formatarCNPJ(contextoTipoPessoa.documento);
    
    const edital = prompt('Qual o Edital:');
    if (!edital) return;
    
    try {
        const resultado = await API.criarProcesso(
            contextoTipoPessoa.sei, 
            `${contextoTipoPessoa.nome}\n${labelDocumento}: ${documento}\nEdital: ${edital}\nSEI: ${contextoTipoPessoa.sei}`
        );
        
        if (resultado && resultado.id) {
            mostrarMensagem('Processo criado! Aplicando template Parecerista...');
            await abrirModalPareceristasPara(resultado.id);
        }
    } catch (erro) {
        console.error('Erro ao criar processo Parecerista:', erro);
        mostrarMensagem('Erro ao criar processo', 'error');
    }
}

// Processador para Palestrante
async function processarTipoPessoaPalestrante(tipoPessoa) {
    const isPF = tipoPessoa === 'pf';
    const labelDocumento = isPF ? 'CPF' : 'CNPJ';
    const documento = isPF ? formatarCPF(contextoTipoPessoa.documento) : formatarCNPJ(contextoTipoPessoa.documento);

    try {
        await API.criarProcesso(
            contextoTipoPessoa.sei,
            `${contextoTipoPessoa.nome}\n${labelDocumento}: ${documento}\nSEI: ${contextoTipoPessoa.sei}`
        );

        mostrarMensagem('Processo de Palestrante criado com sucesso!');
        carregarProcessos();
    } catch (erro) {
        console.error('Erro ao criar processo Palestrante:', erro);
        mostrarMensagem('Erro ao criar processo', 'error');
    }
}

async function criarProcessoOutro() {
    fecharModal('modal-novo-processo');
    
    const nome = prompt('Nome do processo:');
    if (!nome) return;
    
    const descricao = prompt('DescriÃ§Ã£o (opcional):');
    
    try {
        const resultado = await API.criarProcesso(nome, descricao);
        mostrarMensagem('Processo criado com sucesso!');
        carregarProcessos();
    } catch (erro) {
        console.error('Erro ao criar processo:', erro);
        mostrarMensagem('Erro ao criar processo', 'error');
    }
}

async function abrirModalChecklistProcesso(processoId) {
    try {
        const processo = await API.getProcesso(processoId);
        const itens = await API.getChecklist(processoId);
        const templates = await API.getTemplates();
        
        const modal = document.getElementById('modal-checklist');
        const conteudo = document.getElementById('modal-checklist-conteudo');
        
        conteudo.innerHTML = `
            <div class="mb-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">${processo.nome} - Check-list</h3>
                
                <div class="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div class="md:col-span-2">
                        <input type="text" id="novo-item-desc" placeholder="Novo item do check-list" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <button onclick="adicionarItemChecklistProcesso(${processoId})" class="mt-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                            Adicionar Item
                        </button>
                    </div>
                    <div>
                        <label class="text-sm font-semibold text-gray-700">Aplicar Template</label>
                        <select id="select-template-${processoId}" class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="">Selecione um template...</option>
                            ${templates.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
                        </select>
                        <button onclick="aplicarTemplateAoProcesso(${processoId})" class="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Aplicar</button>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <h4 class="font-semibold text-gray-700">Itens:</h4>
                    ${itens.length > 0 ? itens.map(item => `
                        <div class="bg-gray-100 p-3 rounded-lg">
                            <span class="text-gray-800">${item.descricao}</span>
                            ${item.obrigatorio ? '<span class="ml-2 text-red-500 font-bold">*ObrigatÃ³rio</span>' : ''}
                        </div>
                    `).join('') : '<p class="text-gray-500">Nenhum item adicionado ainda</p>'}
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    } catch (erro) {
        console.error('Erro ao abrir modal:', erro);
        mostrarMensagem('Erro ao carregar check-list', 'error');
    }
}

async function adicionarItemChecklistProcesso(processoId) {
    const descricao = document.getElementById('novo-item-desc').value;
    
    if (!descricao.trim()) {
        mostrarMensagem('DescriÃ§Ã£o do item Ã© obrigatÃ³ria', 'error');
        return;
    }
    
    try {
        await API.adicionarItemChecklist(processoId, descricao);
        mostrarMensagem('Item adicionado com sucesso!');
        abrirModalChecklistProcesso(processoId); // Recarregar modal
    } catch (erro) {
        console.error('Erro ao adicionar item:', erro);
        mostrarMensagem('Erro ao adicionar item', 'error');
    }
}

// ===== VERIFICAÃ‡Ã•ES =====
async function carregarVerificacoes() {
    try {
        const verificacoes = await API.getVerificacoes();
        const container = document.getElementById('lista-verificacoes');
        
        if (verificacoes.length === 0) {
            container.innerHTML = '<p class="text-gray-500">Nenhuma verificaÃ§Ã£o realizada. Crie uma nova!</p>';
            return;
        }
        
        container.innerHTML = verificacoes.map(v => `
            <tr class="border-b hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm font-medium text-gray-900">${v.processo_nome}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-block px-3 py-1 text-sm font-semibold rounded-full ${getCorStatus(v.status)}">
                        ${traduzirStatus(v.status)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${v.responsavel || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${formatarData(v.criado_em)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="abrirVerificacao(${v.id})" class="text-blue-600 hover:text-blue-900 font-semibold">
                        Detalhes
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (erro) {
        console.error('Erro ao carregar verificaÃ§Ãµes:', erro);
        mostrarMensagem('Erro ao carregar verificaÃ§Ãµes', 'error');
    }
}

async function startarVerificacao(processoId, processoNome) {
    const responsavel = prompt(`Quem Ã© o responsÃ¡vel pela verificaÃ§Ã£o de "${processoNome}"?`);
    if (!responsavel) return;
    
    try {
        const resultado = await API.criarVerificacao(processoId, responsavel);
        mostrarMensagem('VerificaÃ§Ã£o criada! Redirecionando...');
        setTimeout(() => {
            abrirVerificacao(resultado.id);
        }, 1000);
    } catch (erro) {
        console.error('Erro ao criar verificaÃ§Ã£o:', erro);
        mostrarMensagem('Erro ao criar verificaÃ§Ã£o', 'error');
    }
}

async function abrirVerificacao(verificacaoId) {
    try {
        const verificacao = await API.getVerificacao(verificacaoId);
        
        const modal = document.getElementById('modal-verificacao');
        const conteudo = document.getElementById('modal-verificacao-conteudo');
        
        const progresso = verificacao.progresso || 0;
        
        conteudo.innerHTML = `
            <div class="mb-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-2xl font-bold text-gray-800">${verificacao.processo_nome}</h3>
                        <p class="text-gray-600 mt-1">ResponsÃ¡vel: <strong>${verificacao.responsavel}</strong></p>
                        <p class="text-gray-600">Status: <span class="inline-block px-3 py-1 text-sm font-semibold rounded-full ${getCorStatus(verificacao.status)}">${traduzirStatus(verificacao.status)}</span></p>
                        ${verificacao.processo_descricao ? `
                            <div class="mt-3 p-3 bg-gray-50 rounded border text-sm text-gray-700 whitespace-pre-line">
                                ${verificacao.processo_descricao}
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="mb-6 bg-gray-100 p-4 rounded-lg">
                    <div class="flex justify-between mb-2">
                        <span class="font-semibold text-gray-700">Progresso</span>
                        <span class="text-sm text-gray-600">${verificacao.itens_concluidos}/${verificacao.total_itens}</span>
                    </div>
                    <div class="w-full bg-gray-300 rounded-full h-4">
                        <div class="bg-green-500 h-4 rounded-full transition-all" style="width: ${progresso}%"></div>
                    </div>
                </div>
                
                <div class="space-y-3">
                    ${verificacao.itens.map((item, index) => `
                        <div class="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-white">
                            <input type="checkbox" 
                                id="item-${item.id}"
                                ${item.concluido ? 'checked' : ''} 
                                onchange="atualizarItem(${verificacao.id}, ${item.id}, this.checked)"
                                class="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer">
                            <div class="flex-1">
                                <label for="item-${item.id}" class="font-medium text-gray-800 cursor-pointer">
                                    ${item.descricao}
                                    ${item.obrigatorio ? '<span class="ml-2 text-red-500">*</span>' : ''}
                                </label>
                                <textarea 
                                    id="obs-${item.id}"
                                    placeholder="ObservaÃ§Ã£o sobre este item (opcional)"
                                    class="mt-2 w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="2">${item.observacao || ''}</textarea>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${verificacao.status !== 'concluido' ? `
                    <div class="mt-6 pt-6 border-t border-gray-300">
                        <button onclick="finalizarVerificacao(${verificacao.id})" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg">
                            Finalizar VerificaÃ§Ã£o
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        modal.classList.remove('hidden');
    } catch (erro) {
        console.error('Erro ao abrir verificaÃ§Ã£o:', erro);
        mostrarMensagem('Erro ao carregar verificaÃ§Ã£o', 'error');
    }
}

async function atualizarItem(verificacaoId, itemId, concluido) {
    const observacao = document.getElementById(`obs-${itemId}`).value;
    
    try {
        await API.atualizarItemVerificacao(verificacaoId, itemId, concluido, observacao);
        abrirVerificacao(verificacaoId); // Recarregar modal
    } catch (erro) {
        console.error('Erro ao atualizar item:', erro);
        mostrarMensagem('Erro ao atualizar item', 'error');
    }
}

async function finalizarVerificacao(verificacaoId) {
    if (!confirm('Tem certeza que deseja finalizar esta verificaÃ§Ã£o?')) return;
    
    const observacoes = prompt('ObservaÃ§Ãµes gerais (opcional):');
    
    try {
        await API.concluirVerificacao(verificacaoId, observacoes);
        mostrarMensagem('VerificaÃ§Ã£o finalizada com sucesso!');
        fecharModal('modal-verificacao');
        carregarVerificacoes();
    } catch (erro) {
        console.error('Erro ao finalizar verificaÃ§Ã£o:', erro);
        mostrarMensagem('Erro ao finalizar verificaÃ§Ã£o', 'error');
    }
}

async function aplicarTemplateAoProcesso(processoId) {
    const select = document.getElementById(`select-template-${processoId}`);
    if (!select) return;
    const templateId = select.value;
    if (!templateId) {
        mostrarMensagem('Selecione um template para aplicar', 'error');
        return;
    }

    try {
        const resultado = await API.aplicarTemplate(templateId, processoId);
        if (resultado && resultado.mensagem) {
            mostrarMensagem(resultado.mensagem);
            abrirModalChecklistProcesso(processoId);
        } else if (resultado && resultado.erro) {
            mostrarMensagem(resultado.erro, 'error');
        }
    } catch (erro) {
        console.error('Erro ao aplicar template:', erro);
        mostrarMensagem('Erro ao aplicar template', 'error');
    }
}

// ===== MODAIS =====
function fecharModal(idModal) {
    document.getElementById(idModal).classList.add('hidden');
    
    // Limpar campos do modal tipo pessoa quando fechado
    if (idModal === 'modal-tipo-pessoa') {
        document.querySelectorAll('input[name="tipo-pessoa"]').forEach(r => r.checked = false);
        document.getElementById('input-cpf').value = '';
        document.getElementById('input-cnpj').value = '';
        document.getElementById('campo-cpf').classList.add('hidden');
        document.getElementById('campo-cnpj').classList.add('hidden');
    }
}

window.onclick = function(event) {
    const modais = ['modal-checklist', 'modal-verificacao'];
    modais.forEach(id => {
        const modal = document.getElementById(id);
        if (event.target === modal) {
            fecharModal(id);
        }
    });
}

// Fechar modal ao clicar em X
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.onclick = function() {
            fecharModal(this.dataset.modal);
        }
    });
});

// ===== ARTISTAS (PF / PJ) =====
const LINK_SITUACAO_CPF = 'https://servicos.receita.fazenda.gov.br/Servicos/CPF/ConsultaSituacao/ConsultaPublica.asp';
const ITENS_ARTISTA_PF = [
    {
        descricao: 'CPF e RG do representante/artista',
        obrigatorio: true,
        ordem: 0
    },
    {
        descricao: 'Certidão de quitação eleitoral',
        obrigatorio: true,
        ordem: 1
    },
    {
        descricao: 'Comprovante de endereço do representante/artista',
        obrigatorio: true,
        ordem: 2
    },
    {
        descricao: 'Comprovante bancário',
        obrigatorio: true,
        ordem: 3
    },
    {
        descricao: 'Contrato ou declaração de exclusividade com o artista (firma reconhecida ou assinatura gov.br)',
        obrigatorio: true,
        ordem: 4
    },
    {
        descricao: `Comprovante de situação cadastral do CPF - <a href="${LINK_SITUACAO_CPF}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">Link</a>`,
        obrigatorio: true,
        ordem: 5
    },
    {
        descricao: 'Certidão Federal',
        obrigatorio: true,
        ordem: 6
    },
    {
        descricao: 'Certidão Fazenda Estadual',
        obrigatorio: true,
        ordem: 7
    },
    {
        descricao: 'Certidão Fazenda Municipal',
        obrigatorio: true,
        ordem: 8
    },
    {
        descricao: 'Certidão Trabalhista',
        obrigatorio: true,
        ordem: 9
    },
    {
        descricao: 'Currículo, portfólio e material comprobatório da consagração do artista',
        obrigatorio: true,
        ordem: 10
    },
    {
        descricao: 'Composição de preço (propostas, 3 notas fiscais anteriores, contratos, pesquisas de mercado)',
        obrigatorio: true,
        ordem: 11
    },
    {
        descricao: 'Declaração de inexistência de impedimentos à contratação com o Poder Público',
        obrigatorio: true,
        ordem: 12
    },
    {
        descricao: 'Proposta de apresentação (descrição, duração, local, recursos) (MODELO)',
        obrigatorio: true,
        ordem: 13
    },
    {
        descricao: 'Declarações complementares (MODELO)',
        obrigatorio: true,
        ordem: 14
    },
    {
        descricao: 'Termo de permissão para uso de imagem (MODELO)',
        obrigatorio: true,
        ordem: 15
    },
    {
        descricao: 'Declaração de renúncia de cachê (se aplicável)',
        obrigatorio: false,
        ordem: 16
    },
    {
        descricao: 'Declaração de ciência de cachê assinada pelo artista (MODELO)',
        obrigatorio: true,
        ordem: 17
    }
];
const ITENS_ARTISTA_PJ = [
    {
        descricao: 'HABILITAÇÃO JURÍDICA - CPF e RG do representante/artista',
        obrigatorio: true,
        ordem: 0
    },
    {
        descricao: 'Certidão de quitação eleitoral',
        obrigatorio: true,
        ordem: 1
    },
    {
        descricao: 'Comprovante de endereço do representante/artista',
        obrigatorio: true,
        ordem: 2
    },
    {
        descricao: 'Comprovante bancário',
        obrigatorio: true,
        ordem: 3
    },
    {
        descricao: 'Contrato ou declaração de exclusividade com o artista (firma reconhecida ou assinatura gov.br)',
        obrigatorio: true,
        ordem: 4
    },
    {
        descricao: `Comprovante de situação cadastral do CPF - <a href="${LINK_SITUACAO_CPF}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">Link</a>`,
        obrigatorio: true,
        ordem: 5
    }
];
async function abrirModalArtistas() {
    try {
        const processos = await API.getProcessos();
        const select = document.getElementById('select-processo-artista');
        select.innerHTML = '';
        select.innerHTML = `<option value="">Selecione um processo...</option>` +
            processos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');

        // abrir modal
        document.getElementById('modal-artistas').classList.remove('hidden');
    } catch (err) {
        console.error('Erro ao abrir modal Artistas:', err);
        mostrarMensagem('Erro ao abrir modal Artistas', 'error');
    }
}

async function abrirModalArtistasPara(processoId) {
    try {
        const select = document.getElementById('select-processo-artista');
        select.value = processoId;
        document.getElementById('modal-artistas').classList.remove('hidden');
    } catch (err) {
        console.error('Erro ao abrir modal Artistas:', err);
        mostrarMensagem('Erro ao abrir modal Artistas', 'error');
    }
}

async function aplicarTemplateArtistaTipo(tipo, processoIdOverride = null, options = {}) {
    const { fecharModal = true, abrirChecklist = true } = options;
    const select = document.getElementById('select-processo-artista');
    const processoId = processoIdOverride || select?.value;
    if (!processoId) {
        mostrarMensagem('Selecione um processo antes de aplicar o template', 'error');
        return false;
    }

    try {
        // garantir templates padrÃ£o
        const templates = await API.getTemplates();
        const nomePF = 'Artista - Pessoa FÃ­sica';
        const nomePJ = 'Artista - Pessoa JurÃ­dica';

        let templatePF = templates.find(t => t.nome === nomePF);
        let templatePJ = templates.find(t => t.nome === nomePJ);

        if (!templatePF) {
            const resPF = await API.criarTemplate(
                nomePF,
                'Check-list padrÃ£o para artistas pessoa fÃ­sica',
                ITENS_ARTISTA_PF
            );
            if (resPF && resPF.id) templatePF = { id: resPF.id, nome: nomePF };
        } else {
            await API.atualizarTemplateItens(templatePF.id, ITENS_ARTISTA_PF);
        }

        if (!templatePJ) {
            const resPJ = await API.criarTemplate(
                nomePJ,
                'Check-list padrÃ£o para artistas pessoa jurÃ­dica',
                ITENS_ARTISTA_PJ
            );
            if (resPJ && resPJ.id) templatePJ = { id: resPJ.id, nome: nomePJ };
        } else {
            await API.atualizarTemplateItens(templatePJ.id, ITENS_ARTISTA_PJ);
        }

        const chosenTemplate = tipo === 'pf' ? templatePF : templatePJ;
        if (!chosenTemplate) {
            mostrarMensagem('Template nÃ£o encontrado ou nÃ£o pÃ´de ser criado', 'error');
            return false;
        }

        const resultado = await API.aplicarTemplate(chosenTemplate.id, processoId);
        if (resultado && resultado.mensagem) {
            mostrarMensagem(resultado.mensagem);
            if (abrirChecklist) {
                abrirModalChecklistProcesso(processoId);
            }
            if (fecharModal) {
                fecharModal('modal-artistas');
            }
            return true;
        } else if (resultado && resultado.erro) {
            mostrarMensagem(resultado.erro, 'error');
        }
    } catch (err) {
        console.error('Erro ao aplicar template Artista:', err);
        mostrarMensagem('Erro ao aplicar template Artista', 'error');
    }

    return false;
}

// ===== PARECERISTAS (PF / PJ) =====
async function abrirModalPareceristas() {
    try {
        const processos = await API.getProcessos();
        const select = document.getElementById('select-processo-parecerista');
        select.innerHTML = '';
        select.innerHTML = `<option value="">Selecione um processo...</option>` +
            processos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');

        // abrir modal
        document.getElementById('modal-pareceristas').classList.remove('hidden');
    } catch (err) {
        console.error('Erro ao abrir modal Pareceristas:', err);
        mostrarMensagem('Erro ao abrir modal Pareceristas', 'error');
    }
}

async function abrirModalPareceristasPara(processoId) {
    try {
        const processos = await API.getProcessos();
        const select = document.getElementById('select-processo-parecerista');
        select.innerHTML = '';
        select.innerHTML = `<option value="">Selecione um processo...</option>` +
            processos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
        select.value = processoId;
        document.getElementById('modal-pareceristas').classList.remove('hidden');
    } catch (err) {
        console.error('Erro ao abrir modal Pareceristas:', err);
        mostrarMensagem('Erro ao abrir modal Pareceristas', 'error');
    }
}

async function aplicarTemplateParecerista(tipo) {
    const select = document.getElementById('select-processo-parecerista');
    const processoId = select.value;
    if (!processoId) {
        mostrarMensagem('Selecione um processo antes de aplicar o template', 'error');
        return;
    }

    try {
        // garantir templates padrÃ£o
        const templates = await API.getTemplates();
        const nomePF = 'Parecerista - Pessoa FÃ­sica';
        const nomePJ = 'Parecerista - Pessoa JurÃ­dica';

        let templatePF = templates.find(t => t.nome === nomePF);
        let templatePJ = templates.find(t => t.nome === nomePJ);

        if (!templatePF || !templatePJ) {
            // criar os templates que faltam
            if (!templatePF) {
                const itensPF = [
                    { descricao: 'Documento de Identidade (RG)', obrigatorio: true },
                    { descricao: 'CPF', obrigatorio: true },
                    { descricao: 'Curriculum Lattes / PortfÃ³lio', obrigatorio: true },
                    { descricao: 'Comprovante de endereÃ§o', obrigatorio: true },
                    { descricao: 'ComprovaÃ§Ã£o de titulaÃ§Ã£o/experiÃªncia', obrigatorio: true },
                    { descricao: 'DeclaraÃ§Ã£o de impedimento (se aplicÃ¡vel)', obrigatorio: false }
                ];
                const resPF = await API.criarTemplate(nomePF, 'Check-list padrÃ£o para pareceristas pessoa fÃ­sica', itensPF);
                if (resPF && resPF.id) templatePF = { id: resPF.id, nome: nomePF };
            }

            if (!templatePJ) {
                const itensPJ = [
                    { descricao: 'CNPJ', obrigatorio: true },
                    { descricao: 'Contrato Social / Estatuto', obrigatorio: true },
                    { descricao: 'InscriÃ§Ã£o Municipal', obrigatorio: true },
                    { descricao: 'Documentos dos representantes legais', obrigatorio: true },
                    { descricao: 'ComprovaÃ§Ã£o de acreditaÃ§Ã£o/certificaÃ§Ã£o', obrigatorio: true },
                    { descricao: 'Estrutura e equipe tÃ©cnica', obrigatorio: true }
                ];
                const resPJ = await API.criarTemplate(nomePJ, 'Check-list padrÃ£o para pareceristas pessoa jurÃ­dica', itensPJ);
                if (resPJ && resPJ.id) templatePJ = { id: resPJ.id, nome: nomePJ };
            }
        }

        // Recarregar templates caso tenha criado
        const updatedTemplates = await API.getTemplates();
        templatePF = updatedTemplates.find(t => t.nome === nomePF);
        templatePJ = updatedTemplates.find(t => t.nome === nomePJ);

        const chosenTemplate = tipo === 'pf' ? templatePF : templatePJ;
        if (!chosenTemplate) {
            mostrarMensagem('Template nÃ£o encontrado ou nÃ£o pÃ´de ser criado', 'error');
            return;
        }

        const resultado = await API.aplicarTemplate(chosenTemplate.id, processoId);
        if (resultado && resultado.mensagem) {
            mostrarMensagem(resultado.mensagem);
            // Recarregar modal do processo caso esteja aberto
            abrirModalChecklistProcesso(processoId);
            fecharModal('modal-pareceristas');
        } else if (resultado && resultado.erro) {
            mostrarMensagem(resultado.erro, 'error');
        }
    } catch (err) {
        console.error('Erro ao aplicar template Parecerista:', err);
        mostrarMensagem('Erro ao aplicar template Parecerista', 'error');
    }
}

// ===== DASHBOARD =====
async function carregarDashboard() {
    try {
        const processos = await API.getProcessos();
        const verificacoes = await API.getVerificacoes();
        
        const pendentes = verificacoes.filter(v => v.status === 'pendente').length;
        const emAndamento = verificacoes.filter(v => v.status === 'em_andamento').length;
        const concluidas = verificacoes.filter(v => v.status === 'concluido').length;
        
        document.getElementById('total-processos').textContent = processos.length;
        document.getElementById('verificacoes-pendentes').textContent = pendentes;
        document.getElementById('verificacoes-andamento').textContent = emAndamento;
        document.getElementById('verificacoes-concluidas').textContent = concluidas;
    } catch (erro) {
        console.error('Erro ao carregar dashboard:', erro);
    }
}

// Carregar dashboard ao ativar seÃ§Ã£o
const originalAtivarSecao = ativarSecao;
ativarSecao = function(secao) {
    originalAtivarSecao(secao);
    if (secao === 'dashboard') {
        carregarDashboard();
    }
}

