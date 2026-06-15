FROM node:24-alpine
RUN apk add --no-cache ca-certificates unzip curl

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev
COPY . .

CMD [ "node", "index.js" ]