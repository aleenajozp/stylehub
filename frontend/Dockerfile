# Stage 1: Build React app
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# Stage 2: Serve using unprivileged Nginx (OpenShift compatible)
FROM nginxinc/nginx-unprivileged:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Support OpenShift arbitrary UID by granting permissions to group 0
USER root
RUN chgrp -R 0 /usr/share/nginx/html /etc/nginx /var/cache/nginx /var/log/nginx /tmp && \
    chmod -R g=u /usr/share/nginx/html /etc/nginx /var/cache/nginx /var/log/nginx /tmp

USER 101

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
