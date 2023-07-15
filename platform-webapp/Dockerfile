FROM node:16.20.1-alpine3.18

ARG PLATFORM_WEBAPP_APIKEY

ARG REST_API_DOMAIN

RUN mkdir -p /home/app

WORKDIR /home/app

ENV PORT=3000

COPY . .

RUN npm ci

# Escapes the "/" char by replacing it for "\/". This is needed for the sed command to work properly.
# ${REST_API_DOMAIN//\//\\/}
RUN sed -e "s/{api-key}/$PLATFORM_WEBAPP_APIKEY/g" -e "s/{rest-api-domain}/${REST_API_DOMAIN//\//\\/}/g" ./src/environments/environment.prod.ts > ./src/environments/environment.prod2.ts

RUN mv ./src/environments/environment.prod2.ts ./src/environments/environment.prod.ts

RUN npm run build

RUN mkdir -p ./server/public

RUN cp -r ./dist/AcademicNetworkWebApp/* ./server/public/

RUN cd ./server && npm ci

EXPOSE 3000

CMD [ "node", "server/app.js" ]
