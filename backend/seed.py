"""
Script para popular o banco de dados com dados de exemplo
Execute após inicializar o banco com POST /api/init-db
"""

from models import (
    Database, criar_processo, criar_checklist_item,
    criar_verificacao, adicionar_item_verificacao
)
import mysql.connector
from datetime import datetime, timedelta

def popular_banco_dados():
    """Popula o banco de dados com exemplos"""
    
    # Dados de exemplo de processos
    processos_exemplo = [
        {
            'nome': 'Verificação de Auditoria',
            'descricao': 'Verificação completa de conformidade e auditoria interna',
            'itens': [
                'Revisar documentação financeira',
                'Verificar conformidade com políticas',
                'Auditar registros de acesso',
                'Validar backups',
                'Revisar logs de sistema'
            ]
        },
        {
            'nome': 'Inspeção de Segurança',
            'descricao': 'Inspeção de segurança física e cibernética',
            'itens': [
                'Verificar câmeras de segurança',
                'Testar sistema de alarme',
                'Validar senhas',
                'Revisar acesso de usuários',
                'Atualizar software de segurança'
            ]
        },
        {
            'nome': 'Controle de Qualidade',
            'descricao': 'Avaliação de qualidade dos produtos/serviços',
            'itens': [
                'Inspecionar produtos',
                'Validar documentação',
                'Testar funcionalidades',
                'Revisar feedback de clientes',
                'Documentar desvios'
            ]
        },
        {
            'nome': 'Manutenção Preventiva',
            'descricao': 'Inspeção e manutenção dos equipamentos',
            'itens': [
                'Lubrificar peças móveis',
                'Verificar desgaste',
                'Testar funcionamento',
                'Limpar componentes',
                'Registrar condições'
            ]
        }
    ]
    
    print('Criando processos com check-lists...')
    
    for processo_data in processos_exemplo:
        # Criar processo
        resultado_processo = criar_processo(
            processo_data['nome'],
            processo_data['descricao']
        )
        
        if resultado_processo.get('sucesso'):
            processo_id = resultado_processo['id']
            print(f"✓ Processo criado: {processo_data['nome']} (ID: {processo_id})")
            
            # Adicionar itens do check-list
            for ordem, item_desc in enumerate(processo_data['itens']):
                resultado_item = criar_checklist_item(
                    processo_id,
                    item_desc,
                    obrigatorio=True,
                    ordem=ordem + 1
                )
                
                if resultado_item.get('sucesso'):
                    print(f"  ✓ Item: {item_desc}")
        else:
            print(f"✗ Erro ao criar processo: {resultado_processo.get('erro')}")
    
    print('\n✓ Banco de dados populado com sucesso!')
    print('\nPróximos passos:')
    print('1. Acesse http://localhost:8000 (ou local do frontend)')
    print('2. Clique em "Processos" para ver os processos criados')
    print('3. Clique em "Nova Verificação" para começar uma verificação')

if __name__ == '__main__':
    try:
        popular_banco_dados()
    except Exception as e:
        print(f'✗ Erro: {str(e)}')
        print('\nCertifique-se que:')
        print('- O MySQL está rodando')
        print('- O banco de dados foi inicializado via POST /api/init-db')
        print('- As credenciais em .env estão corretas')
