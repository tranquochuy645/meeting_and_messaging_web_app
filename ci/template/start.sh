#!/bin/bash

# Generate a timestamp for the log file
timestamp=$(date +"%Y%m%d_%H%M%S")
build_log="build_log_$timestamp.txt"

# Parse command line arguments for environment variables and write to .env file
rm -f ".env"
i=1
for env_var in "$@"; do
    echo "$env_var" >> ".env"
    i=$((i + 1))
done


# Check if .env file exists
if [ ! -e ".env" ]; then
    echo "Error: .env file is missing." >&2
    exit 1
fi

image_name="chat_app"

echo "Stopping old containers matching image name: $image_name"
docker stop $(docker ps -q -f ancestor=$image_name --format "{{.ID}}") $>>"$build_log"

echo "Removing old containers matching image name: $image_name"
docker rm $(docker ps -a -q -f ancestor=$image_name --format "{{.ID}}") $>>"$build_log"

# Remove image
echo "Removing old image: $image_name"
docker rmi $image_name $>>"$build_log"

# Rebuild the Docker image
echo "Building Docker image..."
if docker build -t $image_name . >> "$build_log"; then
    echo "Docker image build successful."
else
    echo "Error: Docker image build failed. Check the log at $build_log." >&2
    exit 1
fi

# Start the container with port mapping and environment variables
echo "Starting container with port mapping (80:8080) and environment variables..."
docker run -d -p 80:8080 --env-file .env $image_name &&
echo "Process completed successfully" && exit

echo "Error: Docker run failed check log at $build_log" >$2
exit 1
