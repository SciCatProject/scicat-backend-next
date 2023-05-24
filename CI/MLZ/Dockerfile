# gives a docker image below 200 MB
FROM node:18

ENV NODE_ENV "development"
ENV PORT 3000
EXPOSE 3000
# create local user to avoid running as root
RUN addgroup mygroup
RUN useradd -ms /bin/bash myuser
RUN mkdir -p /usr/src/app && chown -R myuser /usr/src/app
# Prepare app directory
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
COPY CI/MLZ/frontend.config.json /usr/src/app/src/config/
COPY CI/MLZ/migrate-mongo-config.js /usr/src/app/
# RUN npm config set -g production false
# USER myuser
# Install our packages
RUN npm ci

#  patch for loopback-component-passport
# RUN sed -i "s|relations: modelDefinition.relations,|relations: modelDefinition.relations,acls: modelDefinition.acls|" node_modules/loopback-component-passport/lib/index.js

# Copy the rest of our application, node_modules is ignored via .dockerignore
COPY . /usr/src/app
COPY CI/MLZ/envfiles/config.local.js /usr/src/app/server/
COPY CI/MLZ/envfiles/providers.json /usr/src/app/server/
COPY CI/MLZ/envfiles/datasources.json /usr/src/app/server/
COPY CI/MLZ/component-config.json /usr/src/app/server/
COPY CI/MLZ/envfiles/settings.json /usr/src/app/test/config/
COPY CI/MLZ/start.sh /usr/src/app/start.sh
COPY CI/MLZ/frontend.config.json /usr/src/app/src/config/
RUN  mv /usr/src/app/CI/MLZ/MLZ-access-group-service-factory.ts /usr/src/auth/access-group-provider/access-group-service-factory.ts && \

# Start the app
RUN cat /usr/src/app/server/datasources.json
RUN echo "Running startup script"
CMD ./start.sh
