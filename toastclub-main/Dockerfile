FROM node:22-bookworm-slim

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libreoffice \
    libreoffice-impress \
    fonts-dejavu-core \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server ./server

EXPOSE 8080

CMD ["npm", "run", "start:api"]
