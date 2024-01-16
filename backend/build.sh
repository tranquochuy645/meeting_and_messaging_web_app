#!/bin/bash

# Run TypeScript compiler
echo "Compiling TypeScript..."
rm -rf dist
tsc &&
 
# Copy package.json to dist directory
echo "Copying package.json and Dockerfile to dist..."
cp package.json dist/ &&
cp DockerTemplate/* dist/ &&

# Move contents of dist to release directory
echo "moving to release..." 

cp -r dist/* ../release/ 

# cd ../release 


# npm install --omit=dev

