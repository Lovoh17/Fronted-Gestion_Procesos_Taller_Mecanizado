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

# SOLUCIÓN CRÍTICA: Eliminar completamente el archivo CSS problemático
RUN if [ -f "src/assets/EstiloBase.css" ]; then \
    echo "Eliminando archivo CSS problemático temporalmente..." && \
    rm src/assets/EstiloBase.css; \
    fi

RUN npm run build

# Stage 2: production
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]