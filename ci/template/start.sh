#!/bin/bash

# The current pipeline is literally pushing source code to EC2, build the docker image there and run it
# Which is a BAD practice, but I coudldn't find a better option since a private image registry is not provided for free

image_name="chat_app"

build_log="../logs/${image_name}_build_log_$(date +"%Y_%m_%d_%H_%M_%S").txt"

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
    exit 1
fi

old_container_ids=$(docker ps -a -q -f ancestor=$image_name --format "{{.ID}}")

# Rebuild the Docker image
echo "Building Docker image..."
# It will reuse the existing tag, so old image will be untagged
if docker build -t $image_name . &>>"$build_log"; then
    echo "Docker image build successful."
else
    echo "Error: Docker image build failed. Check the log at $build_log." >&2
    exit 1
fi

echo "Stopping old containers matching image name: $image_name"
docker stop $old_container_ids &>>"$build_log"

echo "Removing old containers matching image name: $image_name"
docker rm $old_container_ids &>>"$build_log"

# Start the container with port mapping and environment variables
echo "Starting container with port mapping (8080:8080) and environment variables..."
docker run -d --restart unless-stopped \
    -v /$image_name/media:/app/media \
    --env-file .env \
    -p 8080:8080 \
    $image_name

# Check if there are dangling images and remove them
if docker images -f 'dangling=true' -q | grep -q .; then
    docker rmi $(docker images -f 'dangling=true' -q)
    echo "Dangling images removed."
else
    echo "No dangling images found."
fi

# Check if the container is running
if docker ps | grep -q $image_name; then
    echo "Process completed successfully."
else
    echo "Error: Docker run failed. Check log at $build_log" >&2
    exit 1
fi
