#!/bin/bash

# Parse command line arguments for environment variables
while getopts :e:p: opt; do
    case $opt in
        e)
            echo "$OPTARG" >> ".env"
            ;;
        p)  forward_to_port="$OPTARG"
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            exit 1
            ;;
    esac
done

image_name="chat_app"

echo "Stop old container: $image_name"
docker stop $image_name

echo "Remove old container: $image_name"
docker rm $(docker container ls --all --filter=ancestor=$image_name --format "{{.ID}}") &&

# Remove image
echo "Remove old image: $image_name" &&
docker rmi $image_name &&

# Rebuild the Docker image
echo "Building Docker image..." &&
docker build -t $image_name . &&

# Start the container with port mapping and environment variables
echo "Starting container with port mapping ($forward_to_port:8080) and environment variables..." &&
docker run -p $forward_to_port:8080 --env-file .env $image_name &&

echo "Process completed successfully."

exit
