# Stage 1: build
FROM node:22-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Limpiar cache y instalar TODAS las dependencias (incluyendo devDependencies)
RUN npm cache clean --force
RUN npm ci --include=dev --include=optional

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
    sed -i 's/<style[^>]*>//g' src/assets/EstiloBase.css && \
    sed -i 's/<\/style>//g' src/assets/EstiloBase.css && \
    sed -i '/scoped/d' src/assets/EstiloBase.css && \
    sed -i '/lang=/d' src/assets/EstiloBase.css; \
    fi

# Limpiar cache de Vite antes del build
RUN rm -rf node_modules/.vite 2>/dev/null || true

# Variables de entorno para el build
ENV NODE_ENV=production

# Ejecutar build
RUN npm run build

# Stage 2: production
FROM nginx:alpine

# Copiar configuración de nginx personalizada (opcional)
COPY nginx.conf /etc/nginx/nginx.conf 2>/dev/null || echo "No nginx.conf found, using default"

# Copiar archivos build
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]