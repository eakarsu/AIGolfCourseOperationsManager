#!/bin/bash

# ============================================
# Golf Course Operations Manager - Start Script
# ============================================

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Golf Course Operations Manager${NC}"
echo -e "${GREEN}  Starting Application...${NC}"
echo -e "${GREEN}============================================${NC}"

# Load environment variables
if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    source "$PROJECT_DIR/.env"
    set +a
    echo -e "${BLUE}[INFO]${NC} Environment variables loaded from .env"
else
    echo -e "${RED}[ERROR]${NC} .env file not found! Please create one."
    exit 1
fi

# Function to kill processes on specific ports
cleanup_ports() {
    echo -e "${YELLOW}[CLEANUP]${NC} Checking for processes on ports 4001 and 3000..."

    # Kill process on port 4001 (backend)
    PID_4001=$(lsof -ti:4001 2>/dev/null || true)
    if [ -n "$PID_4001" ]; then
        echo -e "${YELLOW}[CLEANUP]${NC} Killing process on port 4001 (PID: $PID_4001)"
        kill -9 $PID_4001 2>/dev/null || true
        sleep 1
    fi

    # Kill process on port 3000 (frontend)
    PID_3000=$(lsof -ti:3000 2>/dev/null || true)
    if [ -n "$PID_3000" ]; then
        echo -e "${YELLOW}[CLEANUP]${NC} Killing process on port 3000 (PID: $PID_3000)"
        kill -9 $PID_3000 2>/dev/null || true
        sleep 1
    fi

    echo -e "${GREEN}[CLEANUP]${NC} Ports cleared!"
}

# Function to check if PostgreSQL is running
check_postgres() {
    echo -e "${BLUE}[CHECK]${NC} Checking PostgreSQL connection..."
    if pg_isready -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} > /dev/null 2>&1; then
        echo -e "${GREEN}[CHECK]${NC} PostgreSQL is running!"
    else
        echo -e "${RED}[ERROR]${NC} PostgreSQL is not running. Please start PostgreSQL first."
        echo -e "${YELLOW}[HINT]${NC} Try: brew services start postgresql"
        exit 1
    fi
}

# Function to create database if it doesn't exist
create_database() {
    echo -e "${BLUE}[DB]${NC} Checking if database '${DB_NAME}' exists..."
    if psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "${DB_NAME:-golf_course}"; then
        echo -e "${GREEN}[DB]${NC} Database '${DB_NAME}' already exists."
    else
        echo -e "${YELLOW}[DB]${NC} Creating database '${DB_NAME}'..."
        createdb -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} "${DB_NAME:-golf_course}" 2>/dev/null || true
        echo -e "${GREEN}[DB]${NC} Database created!"
    fi
}

# Function to install dependencies
install_dependencies() {
    echo -e "${BLUE}[INSTALL]${NC} Installing server dependencies..."
    cd "$PROJECT_DIR/server"
    npm install --silent 2>/dev/null
    echo -e "${GREEN}[INSTALL]${NC} Server dependencies installed!"

    echo -e "${BLUE}[INSTALL]${NC} Installing client dependencies..."
    cd "$PROJECT_DIR/client"
    npm install --silent 2>/dev/null
    echo -e "${GREEN}[INSTALL]${NC} Client dependencies installed!"

    cd "$PROJECT_DIR"
}

# Function to seed database
seed_database() {
    echo -e "${BLUE}[SEED]${NC} Seeding database with sample data..."
    cd "$PROJECT_DIR/server"
    node seed.js
    echo -e "${GREEN}[SEED]${NC} Database seeded successfully!"
    cd "$PROJECT_DIR"
}

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}[SHUTDOWN]${NC} Shutting down..."

    # Kill background processes
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi

    # Kill processes on ports
    cleanup_ports

    echo -e "${GREEN}[SHUTDOWN]${NC} Application stopped. Goodbye!"
    exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# ============================================
# Main Execution
# ============================================

# Step 1: Clean up ports
cleanup_ports

# Step 2: Check PostgreSQL
check_postgres

# Step 3: Create database
create_database

# Step 4: Install dependencies
install_dependencies

# Step 5: Seed database
seed_database

# Step 6: Start backend with nodemon (auto-reload on changes)
echo -e "${BLUE}[START]${NC} Starting backend server on port 4001 with hot-reload..."
cd "$PROJECT_DIR/server"
npx nodemon index.js &
BACKEND_PID=$!
cd "$PROJECT_DIR"

# Wait for backend to start
sleep 3

# Step 7: Start frontend (React dev server with hot-reload)
echo -e "${BLUE}[START]${NC} Starting frontend on port 3000 with hot-reload..."
cd "$PROJECT_DIR/client"
BROWSER=none npm start &
FRONTEND_PID=$!
cd "$PROJECT_DIR"

echo -e ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Application is starting!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e ""
echo -e "  ${BLUE}Frontend:${NC}  http://localhost:3000"
echo -e "  ${BLUE}Backend:${NC}   http://localhost:4001"
echo -e ""
echo -e "  ${YELLOW}Demo Login:${NC}"
echo -e "    Email:    admin@golfclub.com"
echo -e "    Password: password123"
echo -e ""
echo -e "  ${YELLOW}Press Ctrl+C to stop${NC}"
echo -e ""

# Wait for both processes
wait
