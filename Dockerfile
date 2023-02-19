FROM node
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN yarn global add nodemon
RUN yarn install

COPY . /usr/src/app/
COPY .env.example /usr/src/app/.env
