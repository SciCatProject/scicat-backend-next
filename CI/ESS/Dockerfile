# gives a docker image below 200 MB
FROM node:14-alpine
RUN apk update && apk upgrade && \
    apk add --no-cache git

ENV NODE_ENV "production"
ENV PORT 3000
EXPOSE 3000

# Prepare app directory
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
COPY .snyk /usr/src/app/

# set up local user to avoid running as root
RUN chown -R node:node /usr/src/app
USER node

# Install our packages
RUN npm config set registry http://registry.npmjs.org/
RUN npm config set strict-ssl false
RUN npm ci --only=production

# Copy the rest of our application, node_modules is ignored via .dockerignore
COPY . /usr/src/app
COPY CI/ESS/envfiles/config.ess.js /usr/src/app/server/config.local.js
COPY CI/ESS/envfiles/providers.json /usr/src/app/server/providers.json
COPY CI/ESS/envfiles/datasources.json /usr/src/app/server/datasources.json
RUN NODE_ENV=dev

# Start the app
CMD ["node", "."]
