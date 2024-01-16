#!/bin/bash

set -o errexit

# Parse command line arguments for environment variables
while getopts ":e:p:" opt; do
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

container_name="chat_app"

# Check if the container is running
if [ "$(docker ps -q -f name=$container_name)" ]; then
    echo "Stopping running container: $container_name"
    docker stop $container_name
fi

# Prune images
echo "Pruning Docker images..." &&
docker image prune -a -f &&

# Rebuild the Docker image
echo "Building Docker image..." &&
docker build -t $container_name . &&

# Start the container with port mapping and environment variables
echo "Starting container with port mapping (80:8080) and environment variables..." &&
docker run -p $forward_to_port:8080 --env-file .env $container_name &&

echo "Process completed successfully."

exit
