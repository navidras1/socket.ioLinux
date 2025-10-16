# Use an official Node.js runtime as a base image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm config set unsafe-perm true \
 && apk add --no-cache python3 make g++ \
 && npm ci --only=production

# Copy the rest of the app code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to start the app
CMD ["node", "Server.js"]
