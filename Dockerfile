FROM --platform=amd64 node:16-alpine AS dev

# Prepare app directory
WORKDIR /home/node/app
COPY . .

# Set up local user
RUN chown -R node:node /home/node/app
USER node

# Install dependencies
RUN npm install glob rimraf
RUN npm install

FROM node:16-alpine AS builder 

# Prepare app directory
WORKDIR /usr/src/app

# Set up local user
# Copy files from dev image
COPY --from=dev /home/node/app .

# Build app
RUN npm run build

# Remove development dependencies
RUN npm prune --production

FROM node:16-alpine

# Prepare app directory
WORKDIR /home/node/app

# Set up local user
RUN chown -R node:node /home/node/app
USER node

# Copy files from builder image
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main"]
