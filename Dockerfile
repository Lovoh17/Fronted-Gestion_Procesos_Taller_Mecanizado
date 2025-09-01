# Use specific Node version for consistency
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with verbose logging
RUN npm ci --verbose --no-optional --no-audit

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV CI=true

# Build with explicit command
RUN ["npm", "run", "build"]

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx configuration
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    
    # Serve static files
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Proxy API calls
    location /api/ {
        proxy_pass https://gestionprocesostallermecanizado-production-d0de.up.railway.app/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]