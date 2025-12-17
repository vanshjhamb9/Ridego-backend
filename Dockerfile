# Use official Node.js LTS image
FROM node:18

# Create app directory inside container
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Expose the port your app runs on (update if not 3000)
EXPOSE 8000

# Start the app using nodemon (or node if in production)
CMD ["npx", "nodemon", "app.js"]