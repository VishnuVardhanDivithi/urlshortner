#!/bin/bash

# Install and build frontend first
echo "Building frontend..."
cd project
npm install
npm run build
cd ..

# Install backend dependencies and build
echo "Building backend..."
cd server
npm install
npm install --save-dev typescript@5.5.3 @types/node@20.14.0 @types/express@4.17.21 @types/cors@2.8.17
npx tsc

# Create the public directory in the dist folder
echo "Setting up frontend files for serving..."
mkdir -p dist/public
cp -r ../project/dist/* dist/public/

echo "Build completed successfully!"
