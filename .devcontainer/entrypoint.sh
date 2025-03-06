#!/bin/bash
set -e

# Check if node_modules exists, if not call mkdir -p
if [ ! -d "/workspace/node_modules" ]; then
  echo "Creating node_modules directory"
  sudo mkdir -p /workspace/node_modules/.pnpm
  echo "node_modules directory created"
fi

# Change ownership of the node_modules directory
sudo chown -R $USER:$USER /workspace/node_modules
sudo chown -R $USER:$USER /workspace/node_modules/.pnpm
# Give all permissions to the node_modules directory
chmod -R 0777 /workspace/node_modules
cd /workspace
# Install packages using npm
echo "Installing packages using npm"
sudo npm install -g npm@11.1.0
sudo npm install -g @nestjs/cli
sudo npm install -g prettier jest mocha eslint rimraf
npm install
echo "Packages installed successfully"

# Check if we need to approve builds
echo "Checking if we need to approve builds"
sudo mv /usr/local/bin/approve-builds.exp /workspace
sudo chown $USER:$USER /workspace/approve-builds.exp
expect ./approve-builds.exp
echo "Builds approved successfully"