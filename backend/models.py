import mysql.connector
from mysql.connector import Error
from config import Config
from datetime import datetime

class Database:
    def __init__(self):
        self.connection = None
        self.cursor = None
    
    def connect(self):
        try:
            self.connection = mysql.connector.connect(
                host=Config.MYSQL_HOST,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                database=Config.MYSQL_DB,
                port=Config.MYSQL_PORT
            )
            self.cursor = self.connection.cursor(dictionary=True)
            return True
        except Error as err:
            if err.errno == 2003:
                print("Erro: Nao conseguiu conectar ao servidor MySQL")
            elif err.errno == 1049:
                print(f"Erro: Base de dados '{Config.MYSQL_DB}' nao existe")
            else:
                print(f"Erro: {err}")
            return False
    
    def disconnect(self):
        if self.connection and self.connection.is_connected():
            self.cursor.close()
            self.connection.close()
    
    def init_db(self):
        """Inicializa as tabelas do banco de dados"""
        if not self.connect():
            return False
        
        try:
            # Tabela de Processos
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS processos (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    nome VARCHAR(255) NOT NULL UNIQUE,
                    descricao TEXT,
                    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
                    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
            
            # Tabela de Itens de Check-list
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS checklist_itens (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    processo_id INT NOT NULL,
                    descricao VARCHAR(255) NOT NULL,
                    obrigatorio BOOLEAN DEFAULT TRUE,
                    ordem INT DEFAULT 0,
                    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE CASCADE
                )
            """)
            
            # Tabela de Verificações
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS verificacoes (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    processo_id INT NOT NULL,
                    data_inicio DATETIME,
                    data_conclusao DATETIME,
                    status ENUM('pendente', 'em_andamento', 'concluido') DEFAULT 'pendente',
                    responsavel VARCHAR(255),
                    observacoes TEXT,
                    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (processo_id) REFERENCES processos(id) ON DELETE CASCADE,
                    INDEX idx_status (status),
                    INDEX idx_data (criado_em)
                )
            """)
            
            # Tabela de Resultados de Check-list
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS verificacao_itens (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    verificacao_id INT NOT NULL,
                    checklist_item_id INT NOT NULL,
                    concluido BOOLEAN DEFAULT FALSE,
                    observacao TEXT,
                    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (verificacao_id) REFERENCES verificacoes(id) ON DELETE CASCADE,
                    FOREIGN KEY (checklist_item_id) REFERENCES checklist_itens(id) ON DELETE CASCADE
                )
            """)
            
            # Tabelas para templates de check-list
            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS checklist_templates (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    nome VARCHAR(255) NOT NULL UNIQUE,
                    descricao TEXT,
                    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            self.cursor.execute("""
                CREATE TABLE IF NOT EXISTS checklist_template_itens (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    template_id INT NOT NULL,
                    descricao VARCHAR(255) NOT NULL,
                    obrigatorio BOOLEAN DEFAULT TRUE,
                    ordem INT DEFAULT 0,
                    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (template_id) REFERENCES checklist_templates(id) ON DELETE CASCADE
                )
            """)
            
            self.connection.commit()
            print("Base de dados inicializada com sucesso!")
            return True
        except Error as err:
            print(f"Erro ao criar tabelas: {err}")
            return False
        finally:
            self.disconnect()

# Funções de operações CRUD
def get_db():
    db = Database()
    db.connect()
    return db

def criar_processo(nome, descricao):
    db = get_db()
    try:
        db.cursor.execute(
            "INSERT INTO processos (nome, descricao) VALUES (%s, %s)",
            (nome, descricao)
        )
        db.connection.commit()
        return {"id": db.cursor.lastrowid, "sucesso": True}
    except Error as err:
        return {"erro": str(err), "sucesso": False}
    finally:
        db.disconnect()

def listar_processos():
    db = get_db()
    try:
        db.cursor.execute("SELECT * FROM processos WHERE status = 'ativo' ORDER BY nome")
        return db.cursor.fetchall()
    finally:
        db.disconnect()

def obter_processo(processo_id):
    db = get_db()
    try:
        db.cursor.execute("SELECT * FROM processos WHERE id = %s", (processo_id,))
        return db.cursor.fetchone()
    finally:
        db.disconnect()

def criar_checklist_item(processo_id, descricao, obrigatorio=True, ordem=0):
    db = get_db()
    try:
        db.cursor.execute(
            "INSERT INTO checklist_itens (processo_id, descricao, obrigatorio, ordem) VALUES (%s, %s, %s, %s)",
            (processo_id, descricao, obrigatorio, ordem)
        )
        db.connection.commit()
        return {"id": db.cursor.lastrowid, "sucesso": True}
    except Error as err:
        return {"erro": str(err), "sucesso": False}
    finally:
        db.disconnect()

def listar_checklist_itens(processo_id):
    db = get_db()
    try:
        db.cursor.execute(
            "SELECT * FROM checklist_itens WHERE processo_id = %s ORDER BY ordem",
            (processo_id,)
        )
        return db.cursor.fetchall()
    finally:
        db.disconnect()

def criar_verificacao(processo_id, responsavel, data_inicio=None):
    db = get_db()
    try:
        db.cursor.execute(
            "INSERT INTO verificacoes (processo_id, responsavel, data_inicio, status) VALUES (%s, %s, %s, %s)",
            (processo_id, responsavel, data_inicio or datetime.now(), 'em_andamento')
        )
        db.connection.commit()
        return {"id": db.cursor.lastrowid, "sucesso": True}
    except Error as err:
        return {"erro": str(err), "sucesso": False}
    finally:
        db.disconnect()

def listar_verificacoes(filtro_status=None):
    db = get_db()
    try:
        if filtro_status:
            db.cursor.execute(
                "SELECT v.*, p.nome as processo_nome, p.descricao as processo_descricao FROM verificacoes v JOIN processos p ON v.processo_id = p.id WHERE v.status = %s ORDER BY v.criado_em DESC",
                (filtro_status,)
            )
        else:
            db.cursor.execute(
                "SELECT v.*, p.nome as processo_nome, p.descricao as processo_descricao FROM verificacoes v JOIN processos p ON v.processo_id = p.id ORDER BY v.criado_em DESC"
            )
        return db.cursor.fetchall()
    finally:
        db.disconnect()

def obter_verificacao(verificacao_id):
    db = get_db()
    try:
        db.cursor.execute(
            "SELECT v.*, p.nome as processo_nome, p.descricao as processo_descricao FROM verificacoes v JOIN processos p ON v.processo_id = p.id WHERE v.id = %s",
            (verificacao_id,)
        )
        return db.cursor.fetchone()
    finally:
        db.disconnect()

def adicionar_item_verificacao(verificacao_id, checklist_item_id, concluido=False):
    db = get_db()
    try:
        db.cursor.execute(
            "INSERT INTO verificacao_itens (verificacao_id, checklist_item_id, concluido) VALUES (%s, %s, %s)",
            (verificacao_id, checklist_item_id, concluido)
        )
        db.connection.commit()
        return {"id": db.cursor.lastrowid, "sucesso": True}
    except Error as err:
        return {"erro": str(err), "sucesso": False}
    finally:
        db.disconnect()

def atualizar_item_verificacao(verificacao_item_id, concluido, observacao=None):
    db = get_db()
    try:
        db.cursor.execute(
            "UPDATE verificacao_itens SET concluido = %s, observacao = %s WHERE id = %s",
            (concluido, observacao, verificacao_item_id)
        )
        db.connection.commit()
        return {"sucesso": True}
    except Error as err:
        return {"erro": str(err), "sucesso": False}
    finally:
        db.disconnect()

def obter_itens_verificacao(verificacao_id):
    db = get_db()
    try:
        db.cursor.execute("""
            SELECT vi.*, ci.descricao, ci.obrigatorio 
            FROM verificacao_itens vi 
            JOIN checklist_itens ci ON vi.checklist_item_id = ci.id 
            WHERE vi.verificacao_id = %s 
            ORDER BY ci.ordem
        """, (verificacao_id,))
        return db.cursor.fetchall()
    finally:
        db.disconnect()

def concluir_verificacao(verificacao_id, observacoes=None):
    db = get_db()
    try:
        db.cursor.execute(
            "UPDATE verificacoes SET status = 'concluido', data_conclusao = %s, observacoes = %s WHERE id = %s",
            (datetime.now(), observacoes, verificacao_id)
        )
        db.connection.commit()
        return {"sucesso": True}
    except Error as err:
        return {"erro": str(err), "sucesso": False}
    finally:
        db.disconnect()


# ===== Templates de Check-list =====
def criar_template(nome, descricao=''):
    db = get_db()
    try:
        db.cursor.execute(
            "INSERT INTO checklist_templates (nome, descricao) VALUES (%s, %s)",
            (nome, descricao)
        )
        db.connection.commit()
        return {"id": db.cursor.lastrowid, "sucesso": True}
    except Error as err:
        return {"erro": str(err), "sucesso": False}
    finally:
        db.disconnect()

def listar_templates():
    db = get_db()
    try:
        db.cursor.execute("SELECT * FROM checklist_templates ORDER BY nome")
        return db.cursor.fetchall()
    finally:
        db.disconnect()

def criar_template_item(template_id, descricao, obrigatorio=True, ordem=0):
    db = get_db()
    try:
        db.cursor.execute(
            "INSERT INTO checklist_template_itens (template_id, descricao, obrigatorio, ordem) VALUES (%s, %s, %s, %s)",
            (template_id, descricao, obrigatorio, ordem)
        )
        db.connection.commit()
        return {"id": db.cursor.lastrowid, "sucesso": True}
    except Error as err:
        return {"erro": str(err), "sucesso": False}
    finally:
        db.disconnect()

def substituir_template_itens(template_id, itens):
    db = get_db()
    try:
        db.cursor.execute(
            "DELETE FROM checklist_template_itens WHERE template_id = %s",
            (template_id,)
        )
        for idx, item in enumerate(itens):
            db.cursor.execute(
                "INSERT INTO checklist_template_itens (template_id, descricao, obrigatorio, ordem) VALUES (%s, %s, %s, %s)",
                (
                    template_id,
                    item.get('descricao', ''),
                    item.get('obrigatorio', True),
                    item.get('ordem', idx)
                )
            )
        db.connection.commit()
        return {"sucesso": True, "total": len(itens)}
    except Error as err:
        return {"erro": str(err), "sucesso": False}
    finally:
        db.disconnect()

def listar_template_itens(template_id):
    db = get_db()
    try:
        db.cursor.execute(
            "SELECT * FROM checklist_template_itens WHERE template_id = %s ORDER BY ordem",
            (template_id,)
        )
        return db.cursor.fetchall()
    finally:
        db.disconnect()

def aplicar_template_para_processo(template_id, processo_id):
    """Copia os itens do template para os itens do processo"""
    db = get_db()
    try:
        # Buscar itens do template
        db.cursor.execute(
            "SELECT descricao, obrigatorio, ordem FROM checklist_template_itens WHERE template_id = %s ORDER BY ordem",
            (template_id,)
        )
        itens = db.cursor.fetchall()

        for item in itens:
            db.cursor.execute(
                "INSERT INTO checklist_itens (processo_id, descricao, obrigatorio, ordem) VALUES (%s, %s, %s, %s)",
                (processo_id, item['descricao'], item['obrigatorio'], item['ordem'])
            )

        db.connection.commit()
        return {"sucesso": True, "adicionados": len(itens)}
    except Error as err:
        return {"erro": str(err), "sucesso": False}
    finally:
        db.disconnect()
