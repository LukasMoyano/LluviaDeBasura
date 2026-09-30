from flask import Flask, render_template, request
from flask_compress import Compress
import os

app = Flask(__name__)

# Configuración de compresión GZIP para respuestas (Mejor Práctica para Performance)
compress = Compress()
compress.init_app(app)

@app.route('/')
def index():
    """Ruta principal que renderiza la Landing Page B2B y el entorno del juego."""
    return render_template('index.html')

# Manejo de Errores: 404 Not Found (Mejor Práctica)
@app.errorhandler(404)
def page_not_found(e):
    # En producción idealmente se retorna un template 404 personalizado
    return render_template('index.html'), 404

# Manejo de Errores: 500 Internal Server Error
@app.errorhandler(500)
def internal_server_error(e):
    return "Error Interno del Servidor", 500

if __name__ == '__main__':
    # Usar puerto proveído por el entorno o 5000 por defecto (ideal para PaaS)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
