#!/bin/bash

# Docker deployment script for RSUD Anugerah
set -e

echo "🚀 Starting RSUD Anugerah Docker Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Load environment variables
if [ -f .env.docker ]; then
    echo "📄 Loading environment variables..."
    export $(cat .env.docker | grep -v '#' | awk '/=/ {print $1}')
else
    echo "⚠️  .env.docker file not found. Using default values."
fi

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose down -v  # Stop and remove existing containers
docker-compose build --no-cache  # Build fresh images
docker-compose up -d  # Start in detached mode

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is healthy"
else
    echo "❌ PostgreSQL is not responding"
fi

# Check Backend
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend API is healthy"
else
    echo "❌ Backend API is not responding"
fi

# Check Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "🗄️  Database: localhost:5432"
echo ""
echo "📊 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
echo ""
