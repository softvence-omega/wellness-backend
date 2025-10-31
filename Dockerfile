# ===============================
# Stage 1: Build the NestJS app
# ===============================
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy everything including Prisma schema
COPY . .

# Generate Prisma client before building NestJS
RUN npx prisma generate

# Build the NestJS app
RUN npm run build

# ===============================
# Stage 2: Run the built app
# ===============================
FROM node:18-alpine

WORKDIR /app

# Copy package.json and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built app and Prisma files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose NestJS port
EXPOSE 3007

# Run database migrations automatically (optional)
# You can comment this out if not needed
CMD npx prisma migrate deploy && node dist/main.js
