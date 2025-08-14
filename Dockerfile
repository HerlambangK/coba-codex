# Dev-oriented Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Install without running postinstall (nuxt prepare, prisma generate)
RUN npm ci --ignore-scripts || npm i --ignore-scripts

COPY . .

# Now run postinstall explicitly after schema is present
RUN npm run postinstall || true

EXPOSE 3000

# Use entrypoint script to wait for DB, apply schema, seed, and start
CMD ["/bin/sh", "-lc", "chmod +x scripts/entrypoint.sh && sh scripts/entrypoint.sh"]
