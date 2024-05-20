# Stage 1: Build the frontend
FROM node:18 AS build-frontend

# Set the working directory
WORKDIR /app/frontend

# Copy the frontend package.json and package-lock.json
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ .

# Build the React application
RUN npm run build

# Stage 2: Setup the backend
FROM node:18 AS build-backend

# Set the working directory
WORKDIR /app/backend

# Copy the backend package.json and package-lock.json
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install

# Copy the rest of the backend code
COPY backend/ .

# Compile the smart contract (Placeholder - replace with actual commands)
RUN npx hardhat compile

# Deploy the smart contract to Moonbase (Placeholder - replace with actual commands)
RUN npx hardhat run scripts/deploy.js --network moonbase

# Stage 3: Create the final image for production
FROM node:18 AS final

# Set the working directory
WORKDIR /app

# Copy the build output from the frontend build stage
COPY --from=build-frontend /app/frontend/build ./frontend/build

# Copy the backend code from the backend build stage
COPY --from=build-backend /app/backend ./backend

# Install a simple HTTP server to serve the frontend
RUN npm install -g serve

# Expose the port for the HTTP server and Hardhat node
EXPOSE 5001 8545

# Start both frontend and backend
CMD ["sh", "-c", "cd /app/backend && npx hardhat node & serve -s /app/frontend/build -l 5001"]
