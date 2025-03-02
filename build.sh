#!/bin/bash

# Install backend dependencies and build
echo "Building backend..."
cd server
npm install
npm install --save-dev typescript@5.5.3 @types/node@20.14.0 @types/express@4.17.21 @types/cors@2.8.17
npx tsc

# Install frontend dependencies and build
echo "Building frontend..."
cd ../project
npm install
npm run build

# Copy frontend build to a location accessible by the backend
echo "Copying frontend build to backend dist folder..."
mkdir -p ../server/dist/public
cp -r dist/* ../server/dist/public/

echo "Build completed successfully!"
