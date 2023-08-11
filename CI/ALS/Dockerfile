# gives a docker image below 200 MB
FROM node:18-alpine
RUN apk update && apk upgrade

ENV NODE_ENV "production"
ENV PORT 3000
EXPOSE 3000

# Prepare app directory
WORKDIR /home/node/app
COPY package*.json /home/node/app/
COPY .snyk /home/node/app/

# set up local user to avoid running as root
# RUN chown -R node:node /home/node/app
# USER node

# Install our packages
RUN npm config set registry http://registry.npmjs.org/
RUN npm config set strict-ssl false
RUN npm ci --only=production

# Copy the rest of our application, node_modules is ignored via .dockerignore
COPY  . /home/node/app


# Start the app
CMD ["node", "."]