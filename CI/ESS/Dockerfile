# gives a docker image below 200 MB
FROM node:18-alpine
RUN apk update && apk upgrade && \
    apk add --no-cache git openldap-clients

ENV NODE_ENV "production"
ENV PORT 3000
EXPOSE 3000

# Prepare app directory
WORKDIR /home/node/app
COPY package*.json /home/node/app/

# set up local user to avoid running as root
RUN chown -R node:node /home/node/app
USER node

# Install our packages
RUN npm config set registry http://registry.npmjs.org/
RUN npm config set strict-ssl false
RUN npm ci --only=production

# Copy the rest of our application, node_modules is ignored via .dockerignore
COPY --chown=node:node . /home/node/app
COPY --chown=node:node CI/ESS/envfiles/config.ess.js /home/node/app/server/config.local.js
COPY --chown=node:node CI/ESS/envfiles/providers.json /home/node/app/server/providers.json
COPY --chown=node:node CI/ESS/envfiles/datasources.json /home/node/app/server/datasources.json

# Start the app
CMD ["node", "."]
