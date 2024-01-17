#!/bin/bash

image_name="chat_app"

# Generate a timestamp for the log file
timestamp=$(date +"%Y_%m_%d_%H_%M_%S")
build_log="../logs/${image_name}_build_log_$timestamp.txt"
mkdir "../logs" &>/dev/null
touch "../logs/${image_name}_build_log_$timestamp.txt"

# Parse command line arguments for environment variables and write to .env file
rm -f ".env"
i=1
for env_var in "$@"; do
    echo "$env_var" >>".env"
    i=$((i + 1))
done

# Check if .env file exists
if [ ! -e ".env" ]; then
    echo "Error: .env file is missing." >&2
    echo "Error: .env file is missing." >>$build_log
    exit 1
fi

echo "Stopping old containers matching image name: $image_name" $ >>"$build_log"
docker stop $(docker ps -q -f ancestor=$image_name --format "{{.ID}}") $ >>"$build_log"

echo "Removing old containers matching image name: $image_name"
docker rm $(docker ps -a -q -f ancestor=$image_name --format "{{.ID}}") $ >>"$build_log"

# Remove image
echo "Removing old image: $image_name" $ >>"$build_log"
docker rmi $image_name $ >>"$build_log"

# Rebuild the Docker image
echo "Building Docker image..." $ >>"$build_log"
if docker build -t $image_name . &>>"$build_log"; then
    echo "Docker image build successful."
else
    echo "Error: Docker image build failed. Check the log at $build_log." >&2
    exit 1
fi

# Start the container with port mapping and environment variables
echo "Starting container with port mapping (8080:8080) and environment variables..."
docker run -d --restart unless-stopped -v /media:/app/media --env-file .env -p 8080:8080 $image_name &&
    echo "Process completed successfully" && exit

echo "Error: Docker run failed check log at $build_log" >$2
exit 1
