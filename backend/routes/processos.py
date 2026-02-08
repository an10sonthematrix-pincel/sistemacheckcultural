from flask import Blueprint, request, jsonify
from models import (
    criar_processo, listar_processos, obter_processo,
    atualizar_processo, desativar_processo,
    criar_checklist_item, listar_checklist_itens
)

processos_bp = Blueprint('processos', __name__, url_prefix='/api/processos')

@processos_bp.route('/', methods=['GET'])
def get_processos():
    """Lista todos os processos ativos"""
    processos = listar_processos()
    return jsonify(processos)

@processos_bp.route('/', methods=['POST'])
def post_processo():
    """Cria um novo processo"""
    dados = request.get_json()
    
    if not dados or 'nome' not in dados:
        return jsonify({'erro': 'Nome do processo é obrigatório'}), 400
    
    resultado = criar_processo(dados['nome'], dados.get('descricao', ''))
    
    if resultado.get('sucesso'):
        return jsonify({'id': resultado['id'], 'mensagem': 'Processo criado com sucesso'}), 201
    else:
        return jsonify({'erro': resultado.get('erro')}), 400

@processos_bp.route('/<int:processo_id>', methods=['GET'])
def get_processo(processo_id):
    """Obtém detalhes de um processo específico"""
    processo = obter_processo(processo_id)
    
    if not processo:
        return jsonify({'erro': 'Processo não encontrado'}), 404
    
    # Incluir itens de check-list
    processo['checklist_itens'] = listar_checklist_itens(processo_id)
    
    return jsonify(processo)

@processos_bp.route('/<int:processo_id>', methods=['PUT'])
def put_processo(processo_id):
    """Atualiza nome e descriÃ§Ã£o de um processo"""
    dados = request.get_json()

    if not dados or 'nome' not in dados or not str(dados.get('nome', '')).strip():
        return jsonify({'erro': 'Nome do processo Ã© obrigatÃ³rio'}), 400

    resultado = atualizar_processo(
        processo_id,
        dados['nome'],
        dados.get('descricao', '')
    )

    if resultado.get('sucesso'):
        return jsonify({'mensagem': 'Processo atualizado com sucesso'})
    else:
        return jsonify({'erro': resultado.get('erro')}), 400

@processos_bp.route('/<int:processo_id>', methods=['DELETE'])
def delete_processo(processo_id):
    """Desativa (exclui) um processo"""
    resultado = desativar_processo(processo_id)

    if resultado.get('sucesso'):
        return jsonify({'mensagem': 'Processo excluÃ­do com sucesso'})
    else:
        return jsonify({'erro': resultado.get('erro')}), 400

@processos_bp.route('/<int:processo_id>/checklist', methods=['GET'])
def get_checklist(processo_id):
    """Lista itens de check-list de um processo"""
    itens = listar_checklist_itens(processo_id)
    return jsonify(itens)

@processos_bp.route('/<int:processo_id>/checklist', methods=['POST'])
def post_checklist_item(processo_id):
    """Adiciona um item ao check-list do processo"""
    dados = request.get_json()
    
    if not dados or 'descricao' not in dados:
        return jsonify({'erro': 'Descrição é obrigatória'}), 400
    
    resultado = criar_checklist_item(
        processo_id,
        dados['descricao'],
        dados.get('obrigatorio', True),
        dados.get('ordem', 0)
    )
    
    if resultado.get('sucesso'):
        return jsonify({'id': resultado['id'], 'mensagem': 'Item adicionado com sucesso'}), 201
    else:
        return jsonify({'erro': resultado.get('erro')}), 400
