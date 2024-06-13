FROM node:20.9.0-alpine3.17 

RUN mkdir -p /home/ingsw/docker-react/
WORKDIR /home/ingsw/docker-react/

COPY package*.json /home/ingsw/docker-react/
RUN npm install

COPY . /home/ingsw/docker-react/

EXPOSE 3000
CMD [ "npm", "start" ]
