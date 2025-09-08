# Use official Node.js LTS image
FROM node:22-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (better layer caching)
COPY . ./app

# Install dependencies
RUN npm install 


# Build the app
RUN npm run build

# Expose Nest.js default port
EXPOSE 3000  

# Start the app
CMD ["npm", "run", "start:prod"]
