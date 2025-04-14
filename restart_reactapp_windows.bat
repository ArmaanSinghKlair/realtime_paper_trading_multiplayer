rem Stop any previous container
docker stop realtime-reactapp-image

rem Remove the previously stopped containers
docker rm $(docker ps -a)

rem Discard any previous custom proxy images
docker rmi armaansinghkl/realtime-reactapp-image

rem Build your custom image
docker build --no-cache -t armaansinghkl/realtime-reactapp-image .

rem Run the proxy
docker run -d -p 9000:80 --name realtime-reactapp-image --rm armaansinghkl/realtime-reactapp-image
