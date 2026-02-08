from flask import Flask, jsonify
from flask_cors import CORS
import os
from config import config
from models import Database
from routes.processos import processos_bp
from routes.checklists import checklists_bp
from routes.templates import templates_bp

app = Flask(__name__)

# Configuração
env = os.getenv('FLASK_ENV', 'development')
app.config.from_object(config[env])

# CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Registrar blueprints
app.register_blueprint(processos_bp)
app.register_blueprint(checklists_bp)
app.register_blueprint(templates_bp)

# Rota de teste
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'mensagem': 'Sistema está funcionando'})

# Inicializar banco de dados
@app.route('/api/init-db', methods=['POST'])
def init_db():
    """Inicializa o banco de dados"""
    db = Database()
    if db.init_db():
        return jsonify({'mensagem': 'Banco de dados inicializado com sucesso'}), 201
    else:
        return jsonify({'erro': 'Erro ao inicializar banco de dados'}), 500

# Tratamento de erros
@app.errorhandler(404)
def not_found(error):
    return jsonify({'erro': 'Endpoint não encontrado'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'erro': 'Erro interno do servidor'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
