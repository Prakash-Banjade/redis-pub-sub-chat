# Base image with build dependencies
FROM node:20-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files and build
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine AS production

WORKDIR /usr/src/app

# Copy only necessary files from the build stage
COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./

# Install dependencies
RUN npm install --only=production && npm cache clean --force

# Remove package json files
RUN rm -rf package*.json

# Set NODE_ENV to production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Expose port and set the start command
EXPOSE 3000
CMD ["node", "dist/main.js"]