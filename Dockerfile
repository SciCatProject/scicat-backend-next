# gives a docker image below 200 MB
FROM mhart/alpine-node:6

RUN apk add --update 	python 	build-base
ENV NODE_ENV "production"
ENV PORT 3000
EXPOSE 3000
# create local user to avoid running as root
RUN addgroup mygroup && adduser -D -G mygroup myuser && mkdir -p /usr/src/app && chown -R myuser /usr/src/app

# Prepare app directory
WORKDIR /usr/src/app
COPY package.json /usr/src/app/

USER myuser
# Install our packages
RUN npm install --production

# Copy the rest of our application, node_modules is ignored via .dockerignore
COPY . /usr/src/app

# Start the app
CMD ["node", "."]
