FROM node:24-alpine
RUN apk add --no-cache ca-certificates unzip curl

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD [ "node", "index.js" ]