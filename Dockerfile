# Use nginx to serve static files
FROM nginx:alpine

ARG MODE=static

# Copy static files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY about.html /usr/share/nginx/html/
COPY statistics.html /usr/share/nginx/html/
COPY scripts/ /usr/share/nginx/html/scripts/
COPY data/ /usr/share/nginx/html/data/
COPY styles.css /usr/share/nginx/html/

# Apply build-time mode flag to scripts/config.js
RUN sed -i "s/export const MODE = 'static';/export const MODE = '${MODE}';/" \
    /usr/share/nginx/html/scripts/config.js

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
