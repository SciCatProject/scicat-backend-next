# gives a docker image below 200 MB
FROM node:18-alpine
RUN apk update && apk upgrade && \
    apk add --no-cache git

ENV NODE_ENV "production"
ENV PORT 3000
EXPOSE 3000
# create local user to avoid running as root


# RUN apt-get update && apt-get install -y  ldap-utils
# Prepare app directory
WORKDIR /usr/src/app
COPY package.json /usr/src/app/

#RUN npm config set -g production false
# Install our packages
RUN npm config set registry http://registry.npmjs.org/
RUN npm config set strict-ssl false
RUN npm install --no-optional --only=production


COPY . /usr/src/app
RUN NODE_ENV=dev
# Start the app
CMD ["node", "."]
