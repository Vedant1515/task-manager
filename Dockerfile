FROM node:18

WORKDIR /app

# Copy dependencies and install all (including dev)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

CMD ["npm", "start"]