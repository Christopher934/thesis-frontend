#!/bin/bash

# Fix Backend Health Check Issues Script
echo "🩺 Fixing backend health check issues..."

# Stop containers
echo "🛑 Stopping running containers..."
docker stop rsud-backend 2>/dev/null || true

# Modify the startup command to bypass seed script
echo "🔧 Restarting backend with modified command (skipping seed)..."
docker run -d --name rsud-backend-fixed \
  --network $(docker inspect rsud-backend --format '{{range $net,$v := .NetworkSettings.Networks}}{{$net}}{{end}}') \
  -p 3001:3001 \
  -e DATABASE_URL="$(docker inspect -f '{{range .Config.Env}}{{if (index (regexSplit "=" . 2) 0) eq "DATABASE_URL"}}{{index (regexSplit "=" . 2) 1}}{{end}}{{end}}' rsud-backend)" \
  -e JWT_SECRET="$(docker inspect -f '{{range .Config.Env}}{{if (index (regexSplit "=" . 2) 0) eq "JWT_SECRET"}}{{index (regexSplit "=" . 2) 1}}{{end}}{{end}}' rsud-backend)" \
  -e NODE_ENV="$(docker inspect -f '{{range .Config.Env}}{{if (index (regexSplit "=" . 2) 0) eq "NODE_ENV"}}{{index (regexSplit "=" . 2) 1}}{{end}}{{end}}' rsud-backend)" \
  -e PORT=3001 \
  --entrypoint sh \
  thesis-backend \
  -c "npx prisma migrate deploy && node dist/main"

echo "✅ Backend restarted with modified startup command"
echo "ℹ️ Wait a few moments for the backend to initialize..."

# Check backend status
echo "🔍 Checking backend status..."
sleep 10
docker ps | grep rsud-backend-fixed

echo "🌐 Testing backend health endpoint in 5 seconds..."
sleep 5
curl -s http://localhost:3001/ || echo "Backend not responding yet"

echo "
🎯 Next steps:
1. If the backend is running, restart the frontend
2. Check browser console for fetch errors
3. If errors persist, check the backend logs with: docker logs rsud-backend-fixed
"
