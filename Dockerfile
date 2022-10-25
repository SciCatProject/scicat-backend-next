FROM node:16-alpine AS builder

# Prepare app directory
WORKDIR /usr/src/app
COPY package*.json ./

# Install dependencies
RUN apk add --no-cache python3 make g++
RUN npm install glob rimraf
RUN npm install

COPY . .

# Build app
RUN npm run build


FROM node:16-alpine AS cleaner

# Prepare app directory
WORKDIR /usr/src/app

# Copy files from builder image
COPY --from=builder /usr/src/app .

# Remove development dependencies
RUN npm prune --production


FROM node:16-alpine as dev

# Prepare app directory
WORKDIR /home/node/app

# Copy files from builder image
COPY --from=builder /usr/src/app .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]


FROM node:16-alpine

# Prepare app directory
WORKDIR /home/node/app

# Set up local user
RUN chown -R node:node /home/node/app
USER node

# Copy files from cleaner image
COPY --from=cleaner --chown=node:node /usr/src/app/dist ./dist
COPY --from=cleaner --chown=node:node /usr/src/app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main"]
