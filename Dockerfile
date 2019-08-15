# Get the Node.js stable for this app
FROM node:8.16.0-alpine

# Create app tmp directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app
RUN npm install

RUN npm audit fix # Fix packages issues

# Bundle the app source
COPY . /usr/src/app

EXPOSE 3000
