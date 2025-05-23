# Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./

# Use ARG to pass NODE_ENV and conditionally install dependencies
ARG NODE_ENV
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm install --omit=dev; \
    else \
      npm install; \
    fi

COPY . .

EXPOSE 3002

CMD ["node", "src/server.js"]
