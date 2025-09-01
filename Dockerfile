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

# Asegurar que el archivo CSS existe y es válido
RUN if [ ! -f "src/assets/EstiloBase.css" ]; then \
    echo "Creando archivo CSS básico..." && \
    mkdir -p src/assets && \
    echo '/* Estilos base */ body { margin: 0; padding: 0; font-family: sans-serif; }' > src/assets/EstiloBase.css; \
    fi

# Limpiar el archivo CSS de posibles problemas
RUN if [ -f "src/assets/EstiloBase.css" ]; then \
    echo "Limpiando archivo CSS..." && \
    sed -i '/<style/d' src/assets/EstiloBase.css && \
    sed -i '/<\/style/d' src/assets/EstiloBase.css && \
    sed -i '/scoped/d' src/assets/EstiloBase.css && \
    sed -i '/lang/d' src/assets/EstiloBase.css; \
    fi

RUN npm run build

# Stage 2: production
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]