# Use Node.js 20
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your app
COPY . .

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]