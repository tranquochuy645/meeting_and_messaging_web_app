#!/bin/bash

rm -rf release && #clean up old release dir
mkdir release && #re-create new release dir

# Copy package.json to dist directory
echo "Copying package.json and Dockerfile to dist..."
cp ci/template/* release/ &&

echo "Building frontend bundle..."
cd frontend && npm run build &&

cd ../backend &&
# Run TypeScript compiler
echo "Compiling backend TypeScript..."
rm -rf dist
tsc &&
 
# Move contents of dist to release directory
echo "moving to release..." 
cp -r package.json ../release/ &&
cp -r dist/* ../release/ &&

echo "Built successfully"
