
#### Uses a specific version of the node image
# [Choice] Node.js version: 18, 16, 14
#ARG VARIANT="22"
#FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}

# Uses the latest version of the node image
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node

# [Optional] Install pnpm
RUN npm install -g pnpm

# [Optional] Install additional OS packages.
 RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
     && apt-get -y install --no-install-recommends vim expect htop dos2unix

# [Optional] Install additional global node packages.
# RUN npm install -g <your-package-list-here>

COPY .devcontainer/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY .devcontainer/approve-builds.exp /usr/local/bin/approve-builds.exp
RUN dos2unix /usr/local/bin/entrypoint.sh
RUN dos2unix /usr/local/bin/approve-builds.exp
RUN chmod a+x /usr/local/bin/entrypoint.sh
RUN chmod 0755 /usr/local/bin/approve-builds.exp