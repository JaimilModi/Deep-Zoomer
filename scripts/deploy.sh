#!/bin/bash

# NASA Deep Zoom AI Platform Deployment Script
# This script handles the complete deployment of the platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
BACKEND_PORT=${2:-8000}
FRONTEND_PORT=${3:-3000}
DATABASE_URL=${DATABASE_URL:-"postgresql://postgres:postgres@localhost:5432/nasa_deep_zoom"}
REDIS_URL=${REDIS_URL:-"redis://localhost:6379"}

echo -e "${BLUE}🚀 NASA Deep Zoom AI Platform Deployment${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Backend Port: ${BACKEND_PORT}${NC}"
echo -e "${BLUE}Frontend Port: ${FRONTEND_PORT}${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_status "Node.js found: $(node --version)"
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed"
        exit 1
    fi
    print_status "Python found: $(python3 --version)"
    
    # Check Docker (for production)
    if [ "$ENVIRONMENT" = "production" ]; then
        if ! command -v docker &> /dev/null; then
            print_error "Docker is not installed"
            exit 1
        fi
        print_status "Docker found: $(docker --version)"
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL client not found. Make sure PostgreSQL is running."
    else
        print_status "PostgreSQL client found"
    fi
    
    # Check Redis
    if ! command -v redis-cli &> /dev/null; then
        print_warning "Redis client not found. Make sure Redis is running."
    else
        print_status "Redis client found"
    fi
}

# Install dependencies
install_dependencies() {
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    
    # Frontend dependencies
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install
    print_status "Frontend dependencies installed"
    
    # Backend dependencies
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    cd backend
    pip install -r requirements.txt
    cd ..
    print_status "Backend dependencies installed"
}

# Setup database
setup_database() {
    echo -e "${BLUE}🗄️  Setting up database...${NC}"
    
    # Create database if it doesn't exist
    createdb nasa_deep_zoom 2>/dev/null || print_warning "Database may already exist"
    
    # Run migrations
    cd backend
    alembic upgrade head
    cd ..
    print_status "Database setup complete"
}

# Build application
build_application() {
    echo -e "${BLUE}🔨 Building application...${NC}"
    
    # Build frontend
    echo -e "${BLUE}Building frontend...${NC}"
    npm run build
    print_status "Frontend built successfully"
    
    # Build backend (if needed)
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${BLUE}Building backend Docker image...${NC}"
        docker build -t nasa-deep-zoom-backend ./backend
        print_status "Backend Docker image built"
    fi
}

# Start services
start_services() {
    echo -e "${BLUE}🚀 Starting services...${NC}"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Production deployment with Docker Compose
        echo -e "${BLUE}Starting production services with Docker Compose...${NC}"
        docker-compose up -d
        print_status "Production services started"
    else
        # Development deployment
        echo -e "${BLUE}Starting development services...${NC}"
        
        # Start backend
        echo -e "${BLUE}Starting backend server...${NC}"
        cd backend
        uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT --reload &
        BACKEND_PID=$!
        cd ..
        print_status "Backend server started (PID: $BACKEND_PID)"
        
        # Start frontend
        echo -e "${BLUE}Starting frontend server...${NC}"
        npm run dev -- --port $FRONTEND_PORT &
        FRONTEND_PID=$!
        print_status "Frontend server started (PID: $FRONTEND_PID)"
        
        # Save PIDs for cleanup
        echo $BACKEND_PID > .backend.pid
        echo $FRONTEND_PID > .frontend.pid
    fi
}

# Health check
health_check() {
    echo -e "${BLUE}🏥 Performing health checks...${NC}"
    
    # Wait for services to start
    sleep 5
    
    # Check backend
    if curl -f http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
        print_status "Backend is healthy"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend
    if curl -f http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        print_status "Frontend is healthy"
    else
        print_error "Frontend health check failed"
        return 1
    fi
    
    print_status "All services are healthy"
}

# Display access information
display_access_info() {
    echo -e "${BLUE}🌐 Access Information${NC}"
    echo -e "${GREEN}Frontend: http://localhost:$FRONTEND_PORT${NC}"
    echo -e "${GREEN}Backend API: http://localhost:$BACKEND_PORT${NC}"
    echo -e "${GREEN}API Documentation: http://localhost:$BACKEND_PORT/docs${NC}"
    echo -e "${GREEN}Admin Panel: http://localhost:$BACKEND_PORT/admin${NC}"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${GREEN}Docker Compose Status: docker-compose ps${NC}"
        echo -e "${GREEN}View Logs: docker-compose logs -f${NC}"
    else
        echo -e "${GREEN}Backend Logs: tail -f backend.log${NC}"
        echo -e "${GREEN}Frontend Logs: tail -f frontend.log${NC}"
    fi
}

# Cleanup function
cleanup() {
    echo -e "${BLUE}🧹 Cleaning up...${NC}"
    
    if [ -f .backend.pid ]; then
        kill $(cat .backend.pid) 2>/dev/null || true
        rm .backend.pid
    fi
    
    if [ -f .frontend.pid ]; then
        kill $(cat .frontend.pid) 2>/dev/null || true
        rm .frontend.pid
    fi
    
    print_status "Cleanup complete"
}

# Main deployment function
main() {
    echo -e "${BLUE}Starting deployment process...${NC}"
    
    # Set up signal handlers
    trap cleanup EXIT
    
    # Run deployment steps
    check_prerequisites
    install_dependencies
    setup_database
    build_application
    start_services
    health_check
    display_access_info
    
    echo -e "${GREEN}🎉 Deployment complete!${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
    
    # Keep running in development mode
    if [ "$ENVIRONMENT" = "development" ]; then
        wait
    fi
}

# Handle command line arguments
case "${1:-}" in
    "stop")
        echo -e "${BLUE}🛑 Stopping services...${NC}"
        cleanup
        if [ "$ENVIRONMENT" = "production" ]; then
            docker-compose down
        fi
        print_status "Services stopped"
        ;;
    "restart")
        echo -e "${BLUE}🔄 Restarting services...${NC}"
        cleanup
        main
        ;;
    "logs")
        if [ "$ENVIRONMENT" = "production" ]; then
            docker-compose logs -f
        else
            echo -e "${BLUE}Viewing logs...${NC}"
            tail -f backend.log frontend.log
        fi
        ;;
    "status")
        if [ "$ENVIRONMENT" = "production" ]; then
            docker-compose ps
        else
            echo -e "${BLUE}Service Status:${NC}"
            if [ -f .backend.pid ]; then
                echo -e "${GREEN}Backend: Running (PID: $(cat .backend.pid))${NC}"
            else
                echo -e "${RED}Backend: Not running${NC}"
            fi
            if [ -f .frontend.pid ]; then
                echo -e "${GREEN}Frontend: Running (PID: $(cat .frontend.pid))${NC}"
            else
                echo -e "${RED}Frontend: Not running${NC}"
            fi
        fi
        ;;
    *)
        main
        ;;
esac
