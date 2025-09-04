from app import create_app
from flask import send_from_directory
import os  # Importe o 'os' para a função serve funcionar

app = create_app()

# Configura o Flask para servir os arquivos estáticos da pasta 'static'
# Esta rota é para a abordagem de servir tudo pelo Flask, se optar por ela.


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
