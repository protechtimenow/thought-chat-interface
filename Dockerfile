# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create data directory for persistent storage
RUN mkdir -p data/conversations data/users

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S thoughtchat -u 1001

# Change ownership of app directory
RUN chown -R thoughtchat:nodejs /app
USER thoughtchat

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]