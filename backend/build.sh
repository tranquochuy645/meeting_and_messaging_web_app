#!/bin/bash

# Run TypeScript compiler
echo "Compiling TypeScript..."
tsc &&
 
# Copy package.json to dist directory
echo "Copying package.json to dist..."
cp package.json dist/ &&

# Create the target directory if it doesn't exist
mkdir -p ../../prod/ &&

# Move contents of dist to prod
echo "moving to prod..." 

cp -r dist/* ../prod/ &&

cd ../prod &&


npm install --omit=dev

