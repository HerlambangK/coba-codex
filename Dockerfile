# Dev-oriented Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm i

COPY . .

EXPOSE 3000

CMD ["/bin/sh", "-lc", "npm install && npx prisma migrate deploy && npm run dev"]

