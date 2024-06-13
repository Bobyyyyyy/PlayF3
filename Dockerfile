FROM node:20.9.0-alpine3.17

RUN mkdir -p /home/ingsw/production/
RUN mkdir -p /home/ingsw/production/code/
ADD code/back_end/ /home/ingsw/production/code/back_end/
ADD code/front_end/ /home/ingsw/production/code/front_end/

WORKDIR /home/ingsw/production/code/back_end
COPY code/back_end/package*.json /home/ingsw/production/code/back_end/
RUN npm install
RUN ls -R

WORKDIR /home/ingsw/production/code/front_end
COPY code/front_end/package*.json /home/ingsw/production/code/front_end/
RUN npm install
RUN npm run build
RUN ls -R

COPY code/back_end/* /home/ingsw/production/code/back_end/
COPY code/front_end/* /home/ingsw/production/code/front_end/

WORKDIR /home/ingsw/production/code/back_end
EXPOSE 5080

CMD [ "node", "index.js" ]