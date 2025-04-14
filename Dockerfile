FROM nginx:alpine

# Copy website stuff into nginx default serving dir
COPY dist /usr/share/nginx/html

EXPOSE 9000