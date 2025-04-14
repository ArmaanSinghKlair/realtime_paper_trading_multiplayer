#!/bin/bash

# Stop any previous container
docker stop realtime-reactapp-image

# Remove the previously stopped containers
docker rm $(docker ps -a)

# Discard any previous custom proxy images
docker rmi armaansinghkl/realtime-reactapp-image

# Build your custom image
docker build --no-cache -t armaansinghkl/realtime-reactapp-image .

# Run the proxy
docker run -d --network=host --privileged --name realtime-reactapp-image --rm armaansinghkl/realtime-reactapp-image
