# Usa una imagen oficial de Python ligera
FROM python:3.10-slim

# Establece variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Valor por defecto, servicios cloud como Render/Heroku lo sobreescribirán dinámicamente
ENV PORT=5000

# Crea el directorio de trabajo
WORKDIR /app

# Actualiza sistema e instala paquetes básicos si fuesen necesarios (gcc)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copia los requerimientos e instala las dependencias
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copia el código fuente
COPY . .

# Comando para iniciar el servidor de producción Gunicorn
# Bind a 0.0.0.0 y al puerto definido por el entorno
CMD gunicorn --bind 0.0.0.0:$PORT app:app
