FROM node:20.9.0-alpine3.17 

RUN mkdir -p /home/ingsw/docker-express/
WORKDIR /home/ingsw/docker-express/

COPY package*.json /home/ingsw/docker-express/
RUN npm install

COPY . /home/ingsw/docker-express/

EXPOSE 5080
CMD [ "node", "index.js" ]
