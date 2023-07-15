FROM node:16.20.1-alpine3.18

RUN mkdir -p /home/app

WORKDIR /home/app

ENV PORT=3000

COPY . .

RUN npm ci

RUN apk add openssh-keygen

EXPOSE 3000

CMD ./start.sh
