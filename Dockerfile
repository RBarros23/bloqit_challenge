# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/


ARG NODE_VERSION=22.14.0

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as base

# Set working directory for all build stages.
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

RUN npm install

# Copy prisma schema
COPY src/prisma ./src/prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the source files
COPY . .

RUN npm run build

# Use production node environment by default.
ENV PORT=9000
ENV NODE_ENV=production

# Expose the port that the application listens on.
EXPOSE 9000

# Run the application.
CMD ["npm", "start"]

# build: docker build -t serverimage .
# run: docker run --name my-server-container -p 9000:9000 serverimage