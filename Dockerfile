# Use Node 18
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install ALL dependencies (including dev) for test builds
RUN npm install

# Copy rest of the app
COPY . .

# Set environment variable default
ENV NODE_ENV=development

# Start command for production (won't affect test runs)
CMD ["npm", "start"]
