# ------------------------------------------------------
# 1️⃣ Base Stage - Install dependencies
# ------------------------------------------------------
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# ------------------------------------------------------
# 2️⃣ Runtime Stage - Slim final image
# ------------------------------------------------------
FROM node:22-alpine AS runtime

# Set working directory
WORKDIR /app

# Copy from the previous stage
COPY --from=base /app ./

# Create a non-root user for security
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup
USER nodeuser

# Expose the application port
EXPOSE 3000

# Define default environment
ENV NODE_ENV=production

# Run the app
CMD ["node", "server.js"]
