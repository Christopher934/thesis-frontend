# Comprehensive Fetch Error Fix Documentation

## Issue Summary

The application was experiencing fetch errors when trying to access various backend API endpoints from the frontend. The main issues were:

1. **Port Configuration Mismatch**: Backend was running on port 3001, but some frontend code was trying to access port 3002.
2. **API Path Format Issues**: Redundant `/api` prefix in the URL paths for notification-related endpoints.
3. **Backend Container Health Issues**: The Docker container for the backend was having trouble starting due to seed script errors.
4. **Socket.io Connection Issues**: WebSocket connections failing with ERR_CONNECTION_REFUSED.
5. **Notifications and Shifts Endpoint Issues**: Fetch errors when accessing these endpoints.

## Fixes Applied

### 1. Port Configuration Fix

- Updated the `.env.local` file in the frontend directory to correctly use port 3001:

  ```
  NEXT_PUBLIC_API_URL=http://localhost:3001
  ```

- Modified the API configuration in `frontend/src/config/api.ts` to ensure it uses the correct port:
  ```typescript
  const API_ENDPOINTS = [
    process.env.NEXT_PUBLIC_API_URL,
    "http://localhost:3001", // Backend runs on port 3001
  ].filter(Boolean) as string[];
  ```

### 2. API Path Format Fix

- Fixed the notification endpoint paths in `frontend/src/components/notifications/EnhancedNotificationContext.tsx`:

  - Changed from: `/api/user-notifications/personal` to `/user-notifications/personal`
  - Changed from: `/api/user-notifications/interactive` to `/user-notifications/interactive`
  - Similarly fixed other notification-related endpoints

- Updated the backend controller in `backend/src/notifikasi/user-notifications.controller.ts`:
  - Changed from: `@Controller('api/user-notifications')` to `@Controller('user-notifications')`

### 3. Backend Startup Fix

- Created a modified Dockerfile (`Dockerfile.noseed`) that skips the problematic seed script:

  ```dockerfile
  # Original CMD with seed operation
  # CMD ["sh", "-c", "npx prisma db seed && node dist/main"]

  # New CMD without seed operation
  CMD ["node", "dist/main"]
  ```

- Added a new start mode to `start-app.sh` (`--fix-noseed`) that:
  - Runs PostgreSQL in Docker
  - Starts the backend directly (not in Docker) to avoid seed script issues
  - Starts the frontend with the correct API URL configuration

### 4. Socket.io Connection Fix

- Updated the socket.io connection initialization in `NotificationContext.tsx`:
  ```diff
  - const newSocket = io(`${API_BASE_URL}/notifications`, {
  + const newSocket = io(`${API_BASE_URL}`, {
      auth: {
        token: token
      }
    });
  ```

### 5. Comprehensive Docker Environment Fix

- Created an improved Docker Compose file (`docker-compose.improved.yml`) that:

  - Properly configures all services
  - Skips the problematic seed script
  - Sets correct environment variables
  - Includes health checks for monitoring service status

- Created a specialized restart script (`restart-system-fix-socket.sh`) that:
  - Stops all running containers
  - Cleans up existing Docker resources
  - Starts the system with the improved configuration
  - Waits for the backend to become healthy before proceeding

## How to Use the Fixes

### Option 1: Use the advanced fix script

```bash
# Run diagnostics to check for issues
./advanced-fetch-fix.sh --diagnose

# Apply fixes automatically
./advanced-fetch-fix.sh --fix

# Restart the application with fixes
./advanced-fetch-fix.sh --restart
```

### Option 2: Use the specialized restart script

```bash
# This script applies all fixes and restarts the system with proper configuration
./restart-system-fix-socket.sh
```

### Option 3: Use the modified start script

```bash
# Start with the new fix-noseed mode
./start-app.sh --fix-noseed
```

## Verification Steps

After applying the fixes:

1. The backend should be accessible at http://localhost:3001/health
2. The frontend should be accessible at http://localhost:3000
3. User notifications should load correctly in the frontend
4. No fetch errors should appear in the browser console

## Troubleshooting

If issues persist:

1. Check if the backend is running:

   ```bash
   curl http://localhost:3001/health
   ```

2. Verify the API path configurations:

   ```bash
   grep -r "user-notifications" ./frontend/src
   ```

3. Check for database connectivity issues:

   ```bash
   docker logs rsud-postgres
   ```

4. Examine backend logs for any errors:
   ```bash
   cd backend && npm run start:dev
   ```

## Long-term Recommendations

1. Update the Docker setup to make the seed script optional or fix the module import issue
2. Standardize API path conventions across backend and frontend
3. Add more comprehensive health checks for both services
4. Implement better error handling for API fetch calls in the frontend
