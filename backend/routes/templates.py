from flask import Blueprint, request, jsonify
from models import (
    criar_template, listar_templates, criar_template_item,
    listar_template_itens, aplicar_template_para_processo,
    substituir_template_itens
)

templates_bp = Blueprint('templates', __name__, url_prefix='/api/templates')

@templates_bp.route('/', methods=['GET'])
def get_templates():
    templates = listar_templates()
    return jsonify(templates)

@templates_bp.route('/', methods=['POST'])
def post_template():
    dados = request.get_json()
    if not dados or 'nome' not in dados:
        return jsonify({'erro': 'Nome do template é obrigatório'}), 400

    resultado = criar_template(dados['nome'], dados.get('descricao', ''))
    if resultado.get('sucesso'):
        template_id = resultado['id']
        # opcional: criar itens se enviados
        itens = dados.get('itens') or []
        for idx, item in enumerate(itens):
            criar_template_item(template_id, item.get('descricao', ''), item.get('obrigatorio', True), item.get('ordem', idx))

        return jsonify({'id': template_id, 'mensagem': 'Template criado'}), 201
    else:
        return jsonify({'erro': resultado.get('erro')}), 400

@templates_bp.route('/<int:template_id>/itens', methods=['GET'])
def get_template_itens(template_id):
    itens = listar_template_itens(template_id)
    return jsonify(itens)

@templates_bp.route('/<int:template_id>/itens', methods=['PUT'])
def put_template_itens(template_id):
    dados = request.get_json() or {}
    itens = dados.get('itens')
    if itens is None:
        return jsonify({'erro': 'itens é obrigatório'}), 400

    resultado = substituir_template_itens(template_id, itens)
    if resultado.get('sucesso'):
        return jsonify({'mensagem': 'Itens do template atualizados', 'total': resultado.get('total', 0)})
    else:
        return jsonify({'erro': resultado.get('erro')}), 400

@templates_bp.route('/<int:template_id>/apply', methods=['POST'])
def post_apply_template(template_id):
    dados = request.get_json() or {}
    processo_id = dados.get('processo_id') or request.args.get('processo_id')
    if not processo_id:
        return jsonify({'erro': 'processo_id é obrigatório'}), 400

    resultado = aplicar_template_para_processo(template_id, processo_id)
    if resultado.get('sucesso'):
        return jsonify({'mensagem': 'Template aplicado', 'adicionados': resultado.get('adicionados', 0)})
    else:
        return jsonify({'erro': resultado.get('erro')}), 400
