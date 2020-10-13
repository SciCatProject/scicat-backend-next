# gives a docker image below 200 MB
FROM mhart/alpine-node:10

RUN apk add --update 	python 	build-base git
ENV NODE_ENV "production"
ENV PORT 3000
EXPOSE 3000
# create local user to avoid running as root
RUN addgroup mygroup && adduser -D -G mygroup myuser && mkdir -p /usr/src/app && chown -R myuser /usr/src/app

# Prepare app directory
WORKDIR /usr/src/app
COPY package*.json ./
COPY .snyk ./

USER myuser
# Install our packages
RUN npm ci --production

# Copy the rest of our application, node_modules is ignored via .dockerignore
COPY . /usr/src/app
# this is a hack to allow selected nested keys in queries (tested for Mongo)
COPY CI/PSI/allow_nested_fields_model.js /usr/src/app/node_modules/loopback-datasource-juggler/lib/model.js

# Start the app
CMD ["node", "."]
