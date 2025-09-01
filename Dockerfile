# Stage 1: build
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar archivos necesarios
COPY vite.config.js ./
COPY index.html ./
COPY src/ ./src/
COPY public/ ./public/

# SOLUCIÓN CRÍTICA: Reemplazar completamente el archivo CSS problemático
RUN echo "Reemplazando archivo CSS problemático..." && \
    mkdir -p src/assets && \
    cat > src/assets/EstiloBase.css << 'EOL'
/* Estilos base de la aplicación - Archivo limpio */
body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f5f5f5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.header {
    background-color: #2c3e50;
    color: white;
    padding: 1rem 0;
    text-align: center;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.btn-primary {
    background-color: #3498db;
    color: white;
}

.btn-primary:hover {
    background-color: #2980b9;
}

/* Eliminar cualquier mención de scoped, module, o etiquetas style */
EOL

RUN npm run build

# Stage 2: production
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]