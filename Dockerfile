FROM node:15.3.0

# Fetch latest repos

RUN apt-get update

# Install WebKit dependencies
RUN apt-get install -y libopus0 \
                       libwebp6 \
                       libwebpdemux2 \
                       libenchant1c2a \
                       libgudev-1.0-0 \
                       libsecret-1-0 \
                       libhyphen0 \
                       libgdk-pixbuf2.0-0 \
                       libnotify4 \
                       libxslt1.1 \
                       libgles2 

# Install Chromium dependencies

RUN apt-get install -y libnss3 \
                       libxss1 \
                       libasound2

# Install Firefox dependencies

RUN apt-get install -y libdbus-glib-1-2 \
                       libxt6

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Build project
RUN npm run build

EXPOSE 3333
CMD [ "npm", "start" ]