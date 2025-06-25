FROM node:22 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
RUN npm install -g http-server
COPY --from=builder /app/dist /app/dist

EXPOSE 5173

CMD ["http-server", "dist", "-p", "5173"]
