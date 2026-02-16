#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Stopping all services...${NC}"

# Stop Docker services
cd "$(dirname "$0")"
docker-compose down

echo -e "${GREEN}✓ All services stopped${NC}"
echo -e "${YELLOW}Note: Frontend and Node.js backend should be stopped with Ctrl+C in their terminal${NC}"
