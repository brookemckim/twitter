FROM node:6
WORKDIR /usr/src/app
COPY . .
EXPOSE 3000
CMD [ "npm", "start" ]

