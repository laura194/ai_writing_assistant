#!/bin/bash
# stop on first error
set -e

echo "🚀 Starting local development environment..."

# Step 1 & 2: Navigate to Docker folder
echo "📂 Changing directory to docker-files/Complete Project..."
cd docker-files/"Complete Project"

# Step 3: Start Docker containers
echo "🐳 Starting Docker containers..."
docker compose up -d

# Step 4: Go back to project root
cd ../../

# Step 4: Install dependencies
echo "📦 Installing NPM dependencies..."
npm install

# Step 4.1: Fix vulnerabilities if needed
echo "🔧 Running npm audit fix..."
npm audit fix || true

# Step 5: Start the project
echo "▶️ Starting the project..."
npm start