# Extend official Soketi image and add app manager
FROM quay.io/soketi/soketi:1.4-16-alpine

# We'll set ENTRYPOINT later after copying docker-entrypoint.sh

# Install Node.js dependencies for app manager (keep /app for Soketi)
WORKDIR /app-manager

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production --ignore-scripts && \
    npm cache clean --force && \
    rm -rf /tmp/* /root/.npm

# Copy application files
COPY src/ ./src/
COPY public/ ./public/
COPY soketi.json /app/soketi.json.default
COPY start-services.js ./
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Make entrypoint executable
RUN chmod +x /docker-entrypoint.sh

# Expose app manager port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/apps', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use entrypoint to initialize config, then run the command
ENTRYPOINT ["/docker-entrypoint.sh"]

# Start both services
WORKDIR /app-manager
CMD ["node", "/app-manager/start-services.js"]
