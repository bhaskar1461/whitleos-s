#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Starting Fitness Journal Tracker${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Docker is running
if ! command_exists docker; then
    echo -e "${RED}Error: Docker is not installed or not running${NC}"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}Error: Docker daemon is not running${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command_exists node; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

# Step 1: Start Docker services (PostgreSQL, Redis, FastAPI)
echo -e "\n${YELLOW}[1/4] Starting Docker services (PostgreSQL, Redis, FastAPI)...${NC}"
cd "$(dirname "$0")"

# Check if containers are already running
if docker ps --format '{{.Names}}' | grep -q "fastapi_app\|postgres_db\|redis_cache"; then
    echo -e "${GREEN}Docker services already running${NC}"
else
    # Start Docker services in detached mode
    docker-compose up -d postgres redis
    
    # Wait for PostgreSQL and Redis to be ready
    echo -e "${YELLOW}Waiting for PostgreSQL and Redis to be ready...${NC}"
    sleep 5
    
    # Start FastAPI service
    docker-compose up -d api
    
    echo -e "${GREEN}✓ Docker services started${NC}"
fi

# Step 2: Install npm dependencies if needed
echo -e "\n${YELLOW}[2/4] Checking npm dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Step 3: Create db.json if it doesn't exist
echo -e "\n${YELLOW}[3/4] Checking database file...${NC}"
if [ ! -f "server/db.json" ]; then
    echo -e "${YELLOW}Creating initial database file...${NC}"
    mkdir -p server
    cat > server/db.json << 'EOF'
{
  "journal": [],
  "steps": [],
  "meals": [],
  "workouts": [],
  "webhooks": []
}
EOF
    echo -e "${GREEN}✓ Database file created${NC}"
else
    echo -e "${GREEN}✓ Database file exists${NC}"
fi

# Step 4: Start frontend and backend together
echo -e "\n${YELLOW}[4/4] Starting frontend and backend...${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Services starting:${NC}"
echo -e "${GREEN}  - React Frontend:    http://localhost:3000${NC}"
echo -e "${GREEN}  - Node.js Backend:   http://localhost:4000${NC}"
echo -e "${GREEN}  - FastAPI Backend:   http://localhost:8000${NC}"
echo -e "${GREEN}  - API Docs:          http://localhost:8000/docs${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${BLUE}Press Ctrl+C to stop all services${NC}\n"

# Start both frontend and backend using npm dev script
npm run dev
