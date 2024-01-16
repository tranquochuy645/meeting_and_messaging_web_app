#!/bin/bash

# Parse command line arguments for environment variables
while getopts :e: opt; do
    case $opt in
        e)
            echo "$OPTARG" > ".env"
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            exit 1
            ;;
    esac
done

# Check if .env file exists
if [ ! -e ".env" ]; then
    echo "Error: .env file is missing." >&2
    exit 1
fi

image_name="chat_app"

echo "Stop old container: $image_name"
docker stop $(docker ps -q -f ancestor=$image_name --format "{{.ID}}")

echo "Remove old container: $image_name"
docker rm $(docker ps -a -q -f ancestor=$image_name --format "{{.ID}}")

# Remove image
echo "Remove old image: $image_name"
docker rmi $image_name

# Rebuild the Docker image
echo "Building Docker image..." &&
docker build -t $image_name . &&

# Start the container with port mapping and environment variables
echo "Starting container with port mapping (80:8080) and environment variables..." &&
docker run -p 80:8080 --env-file .env $image_name &&

echo "Process completed successfully."

exit
