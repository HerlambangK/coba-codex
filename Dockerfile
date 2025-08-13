# Dev-oriented Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm i

COPY . .

EXPOSE 3000

# Use entrypoint script to wait for DB, apply schema, seed, and start
CMD ["/bin/sh", "-lc", "chmod +x scripts/entrypoint.sh && sh scripts/entrypoint.sh"]
