# Use an official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock or package-lock.json
COPY package.json yarn.lock ./

# Install project dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Expose a port for the Metro bundler
EXPOSE 8081

# Start the Metro bundler
CMD ["yarn", "start"]
