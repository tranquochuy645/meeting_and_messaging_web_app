#!/bin/bash

# Run TypeScript compiler
echo "Compiling TypeScript..."
rm -rf dist
tsc &&
 
# Copy package.json to dist directory
echo "Copying package.json to dist..."
cp package.json dist/ &&


# Move contents of dist to release directory
echo "moving to release..." 

cp -r dist/* ../release/ 

# cd ../release 


# npm install --omit=dev

