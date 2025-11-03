# ==============================
# 1️⃣ Build Stage
# ==============================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the code
COPY . .

# Build the React app
RUN yarn build


# ==============================
# 2️⃣ Production Stage
# ==============================
FROM nginx:1.27-alpine
# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Nginx default port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
