#!/bin/sh

# Docker Startup Script with Auto-Seeding
# This script starts the NestJS application and automatically seeds the database if needed

echo "🚀 Starting NestJS application..."

# Start the application in the background
node dist/main.js &
APP_PID=$!

# Wait for the application to be ready (max 30 seconds)
echo "⏳ Waiting for application to be ready..."
sleep 5

# Run auto-seed in the background (it will check and seed if needed)
echo "🌱 Running auto-seed check..."
node auto-seed-docker.js &

# Wait for the main application process
wait $APP_PID
