FROM node:18

WORKDIR /app

# Copy dependencies and install ALL (including dev)
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

CMD ["npm", "start"]
