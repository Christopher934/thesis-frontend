#!/bin/bash
# Script to run the entire application manually

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting manual application setup...${NC}"

# Check if PostgreSQL is running
echo -e "${YELLOW}Checking PostgreSQL status...${NC}"
pg_isready -h localhost -p 5433 > /dev/null 2>&1

if [ $? -ne 0 ]; then
  echo -e "${RED}PostgreSQL is not running on port 5433. Please start PostgreSQL first.${NC}"
  exit 1
else
  echo -e "${GREEN}PostgreSQL is running on port 5433.${NC}"
fi

# Check if database exists
echo -e "${YELLOW}Checking if database exists...${NC}"
psql -h localhost -p 5433 -U postgres -lqt | cut -d \| -f 1 | grep -qw rsud_anugerah

if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Database 'rsud_anugerah' does not exist. Creating it...${NC}"
  psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE rsud_anugerah;"
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create database. Please create it manually.${NC}"
    exit 1
  else
    echo -e "${GREEN}Database 'rsud_anugerah' created successfully.${NC}"
  fi
else
  echo -e "${GREEN}Database 'rsud_anugerah' exists.${NC}"
fi

# Start backend in a new terminal window
echo -e "${YELLOW}Starting backend...${NC}"
osascript -e 'tell app "Terminal" to do script "cd /Users/jo/Downloads/Thesis/backend && npm run start:prod"'

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to start...${NC}"
sleep 5

# Start frontend in a new terminal window
echo -e "${YELLOW}Starting frontend...${NC}"
osascript -e 'tell app "Terminal" to do script "cd /Users/jo/Downloads/Thesis/frontend && npm run dev"'

echo -e "${GREEN}Application started successfully!${NC}"
echo -e "${GREEN}Backend running at: http://localhost:3001${NC}"
echo -e "${GREEN}Frontend running at: http://localhost:3000${NC}"
echo -e "${YELLOW}Note: You may need to check the terminal windows for any errors.${NC}"
