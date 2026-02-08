from flask import Blueprint, request, jsonify
from models import (
    criar_verificacao, listar_verificacoes, obter_verificacao,
    adicionar_item_verificacao, atualizar_item_verificacao,
    obter_itens_verificacao, concluir_verificacao,
    listar_checklist_itens
)

checklists_bp = Blueprint('checklists', __name__, url_prefix='/api/verificacoes')

@checklists_bp.route('/', methods=['GET'])
def get_verificacoes():
    """Lista todas as verificações"""
    filtro_status = request.args.get('status')
    verificacoes = listar_verificacoes(filtro_status)
    return jsonify(verificacoes)

@checklists_bp.route('/', methods=['POST'])
def post_verificacao():
    """Cria uma nova verificação"""
    dados = request.get_json()
    
    if not dados or 'processo_id' not in dados:
        return jsonify({'erro': 'processo_id é obrigatório'}), 400
    
    resultado = criar_verificacao(
        dados['processo_id'],
        dados.get('responsavel', ''),
        dados.get('data_inicio')
    )
    
    if resultado.get('sucesso'):
        verificacao_id = resultado['id']
        
        # Copiar todos os itens do check-list do processo para a verificação
        itens = listar_checklist_itens(dados['processo_id'])
        for item in itens:
            adicionar_item_verificacao(verificacao_id, item['id'], False)
        
        return jsonify({
            'id': verificacao_id,
            'mensagem': 'Verificação criada com sucesso'
        }), 201
    else:
        return jsonify({'erro': resultado.get('erro')}), 400

@checklists_bp.route('/<int:verificacao_id>', methods=['GET'])
def get_verificacao(verificacao_id):
    """Obtém detalhes de uma verificação"""
    verificacao = obter_verificacao(verificacao_id)
    
    if not verificacao:
        return jsonify({'erro': 'Verificação não encontrada'}), 404
    
    # Incluir itens da verificação
    verificacao['itens'] = obter_itens_verificacao(verificacao_id)
    
    # Calcular progresso
    itens = verificacao['itens']
    if itens:
        concluidos = sum(1 for item in itens if item['concluido'])
        obrigatorios = sum(1 for item in itens if item['obrigatorio'])
        verificacao['itens_concluidos'] = concluidos
        verificacao['total_itens'] = len(itens)
        verificacao['progresso'] = (concluidos / len(itens)) * 100 if itens else 0
        verificacao['obrigatorios_concluidos'] = sum(1 for item in itens if item['obrigatorio'] and item['concluido'])
        verificacao['total_obrigatorios'] = obrigatorios
    
    return jsonify(verificacao)

@checklists_bp.route('/<int:verificacao_id>/item/<int:item_id>', methods=['PUT'])
def put_verificacao_item(verificacao_id, item_id):
    """Atualiza o status de um item da verificação"""
    dados = request.get_json()
    
    if 'concluido' not in dados:
        return jsonify({'erro': 'Campo "concluido" é obrigatório'}), 400
    
    resultado = atualizar_item_verificacao(
        item_id,
        dados['concluido'],
        dados.get('observacao')
    )
    
    if resultado.get('sucesso'):
        return jsonify({'mensagem': 'Item atualizado com sucesso'})
    else:
        return jsonify({'erro': resultado.get('erro')}), 400

@checklists_bp.route('/<int:verificacao_id>/concluir', methods=['POST'])
def post_concluir_verificacao(verificacao_id):
    """Conclui uma verificação"""
    dados = request.get_json() or {}
    
    resultado = concluir_verificacao(
        verificacao_id,
        dados.get('observacoes')
    )
    
    if resultado.get('sucesso'):
        return jsonify({'mensagem': 'Verificação concluída com sucesso'})
    else:
        return jsonify({'erro': resultado.get('erro')}), 400
