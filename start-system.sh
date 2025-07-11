#!/bin/bash
# Essential system start script
echo "Starting Thesis Hospital Management System..."
echo "Starting Backend..."
cd backend && npm run start:dev &
echo "Starting Frontend..."
cd ../frontend && npm run dev &
echo "System started! Backend: http://localhost:3001, Frontend: http://localhost:3000"
