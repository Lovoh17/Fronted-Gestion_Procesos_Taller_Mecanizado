FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install http-server globally
RUN npm install -g http-server

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5173

# Start the server
CMD ["http-server", "dist", "-p", "5173", "-c-1"]