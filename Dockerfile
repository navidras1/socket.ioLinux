FROM node:22-alpine AS runtime

# Set working directory
WORKDIR /app

# Copy only the necessary files from build stage
COPY --from=base /app ./

# Create a non-root user for security
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup
USER nodeuser

# Expose port (match your app’s port)
EXPOSE 3000

# Start the Node.js application
CMD ["node", "server.js"]